import { createServer } from "node:http";
import { createAstroRuntime } from "@casoon/fragment-renderer";
import { emailPreset } from "@casoon/fragment-renderer/presets/email";
import WelcomeEmail from "./templates/WelcomeEmail.astro";

const PORT = 3002;

const preset = emailPreset({ provider: "sendgrid" });
const runtime = createAstroRuntime({
	baseContext: preset.baseContext,
	services: preset.services,
});

runtime.registerComponent("order-confirmation", () => import("./templates/OrderConfirmation.astro"));

const server = createServer(async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);
	const emailService = await runtime.getService("email");

	if (url.pathname === "/") {
		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		res.end(`<!DOCTYPE html>
<html>
<head><title>Email Templates Preview</title></head>
<body style="font-family: sans-serif; padding: 2rem; background: #f8fafc; color: #0f172a;">
  <h1>Email Templates Preview Server</h1>
  <ul>
    <li><a href="/welcome" target="preview">Welcome Email (Rendered from Import)</a></li>
    <li><a href="/order" target="preview">Order Confirmation (Rendered by ID)</a></li>
  </ul>
  <hr />
  <iframe name="preview" style="width: 100%; height: 600px; border: 1px solid #cbd5e1; background: #ffffff;"></iframe>
</body>
</html>`);
		return;
	}

	try {
		if (url.pathname === "/welcome") {
			const html = await runtime.renderComponent(WelcomeEmail, {
				userName: "Max Mustermann",
				activationLink: "https://example.com/activate?token=998877",
			});
			const wrapped = emailService.wrapInEmailLayout(html, {
				title: "Willkommen!",
				preheader: "Wir freuen uns, dich dabei zu haben.",
			});
			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			res.end(wrapped);
			return;
		}

		if (url.pathname === "/order") {
			const { html, subject } = await emailService.renderEmail("order-confirmation", {
				orderId: "DE-2026-ABC",
				customerName: "Max Mustermann",
				items: [
					{ name: "SaaS Starter Plan (monatlich)", price: "19.00 €" },
					{ name: "Addon: Extra Storage (100GB)", price: "5.00 €" },
				],
				total: "24.00 €",
			});
			const wrapped = emailService.wrapInEmailLayout(html, {
				title: subject || "Bestätigung",
			});
			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			res.end(wrapped);
			return;
		}

		res.writeHead(404);
		res.end("Not Found");
	} catch (error) {
		res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		res.end(`Fehler beim Rendern der E-Mail: ${error.message}`);
	}
});

server.listen(PORT, () => {
	console.log(`Email Preview-Server läuft unter http://localhost:${PORT}`);
});
