import { writeFileSync, mkdirSync } from "node:fs";
import { createAstroRuntime } from "@casoon/fragment-renderer";
import OGCard from "./templates/OGCard.astro";

async function main() {
	console.log("Initializing runtime for OG card...");

	const runtime = createAstroRuntime({
		baseContext: { channel: "og" },
	});

	console.log("Rendering OGCard.astro...");
	const html = await runtime.renderComponent(OGCard, {
		title: "Wie man Astro-Komponenten überall rendert",
		description: "Ein tiefer Einblick in den neuen @casoon/fragment-renderer und wie man ihn in Serverless-Umgebungen einsetzt.",
		author: "Johannes Seidel",
		date: "01. Juni 2026",
		bgColor: "#0f172a",
		accentColor: "#10b981",
	});

	mkdirSync("./dist", { recursive: true });
	writeFileSync("./dist/og-card.html", html, "utf-8");

	console.log("OG Card HTML erfolgreich generiert unter ./dist/og-card.html!");
	console.log("Dieses HTML kann mit Puppeteer oder Playwright in ein PNG konvertiert werden.");
}

main().catch(console.error);
