import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createAstroRuntime } from "@casoon/fragment-renderer";
import { emailPreset } from "@casoon/fragment-renderer/presets/email";
import WelcomeEmail from "./templates/WelcomeEmail.astro";
import OrderConfirmation from "./templates/OrderConfirmation.astro";

async function main() {
	console.log("Setting up Email renderer preset...");

	const preset = emailPreset({ provider: "ses" });
	const runtime = createAstroRuntime({
		baseContext: preset.baseContext,
		services: preset.services,
	});

	// Get the email helper service
	const emailService = await runtime.getService("email");

	// 1. Render Welcome Email
	console.log("Rendering WelcomeEmail.astro...");
	const welcomeHtml = await runtime.renderComponent(WelcomeEmail, {
		userName: "Jane Doe",
		activationLink: "https://example.com/activate?token=xyz987",
	});

	// Wrap in a table structure to make it email client safe
	const wrappedWelcome = emailService.wrapInEmailLayout(welcomeHtml, {
		title: "Willkommen an Bord!",
		preheader: "Dein Aktivierungslink für das Kundenkonto.",
	});

	// Write to output folder
	mkdirSync("./dist", { recursive: true });
	writeFileSync("./dist/welcome-email.html", wrappedWelcome, "utf-8");
	console.log("Written output to ./dist/welcome-email.html");

	// 2. Render Order Confirmation (by ID)
	console.log("Rendering OrderConfirmation.astro by registering in runtime first...");

	runtime.registerComponent("order-confirmation", () => import("./templates/OrderConfirmation.astro"));

	const { html, subject } = await emailService.renderEmail("order-confirmation", {
		orderId: "DE-2024-99812",
		customerName: "Jane Doe",
		items: [
			{ name: "Premium Abonnement (1 Jahr)", price: "99.00 €" },
			{ name: "Einrichtungsgebühr", price: "0.00 €" },
		],
		total: "99.00 €",
	});

	const wrappedOrder = emailService.wrapInEmailLayout(html, {
		title: subject || "Bestellbestätigung",
		preheader: "Vielen Dank für Ihren Einkauf!",
	});

	writeFileSync("./dist/order-confirmation.html", wrappedOrder, "utf-8");
	console.log("Written output to ./dist/order-confirmation.html");

	console.log("Finished rendering all emails.");
}

main().catch(console.error);
