import { createAstroRuntime } from "@casoon/fragment-renderer";
import { cmsPreset } from "@casoon/fragment-renderer/presets/cms";

async function main() {
	console.log("Setting up CMS block renderer preset...");

	// 1. Configure the CMS preset with block mappings
	const preset = cmsPreset({
		provider: "strapi",
		blocks: [
			{ id: "blocks.hero", loader: () => import("./blocks/Hero.astro") },
			{ id: "blocks.feature-grid", loader: () => import("./blocks/FeatureGrid.astro") },
			{ id: "blocks.testimonial", loader: () => import("./blocks/Testimonial.astro") },
			{ id: "blocks.cta", loader: () => import("./blocks/CTA.astro") },
		],
	});

	// 2. Initialize the AstroRuntime
	const runtime = createAstroRuntime({
		baseContext: preset.baseContext,
		components: preset.components,
		services: preset.services,
	});

	// 3. Get the CMS service
	const cms = await runtime.getService("cms");

	// 4. Define page block structure (simulate data fetched from headless CMS)
	const pageBlocks = [
		{
			type: "hero",
			data: {
				title: "Willkommen auf unserer Webseite!",
				subtitle: "Gebaut mit Astro und dem Fragment Renderer.",
				ctaText: "Jetzt starten",
				ctaHref: "#start",
				align: "center",
			},
		},
		{
			type: "feature-grid",
			data: {
				features: [
					{ title: "Zero-Config", description: "Sofort startbereit ohne Konfiguration." },
					{ title: "Universal", description: "Rendert auf jeder Plattform (Vercel, Cloudflare, Node.js)." },
					{ title: "Multi-Channel", description: "Ein Code für Web, E-Mail und Social Previews." },
				],
			},
		},
		{
			type: "testimonial",
			data: {
				quote: "Dieses Paket hat unsere Integration von headless CMS-Blöcken drastisch vereinfacht.",
				author: "Jane Doe, Senior Frontend Engineer",
			},
		},
		{
			type: "cta",
			data: {
				text: "Bereit für den nächsten Schritt?",
				href: "#order",
			},
		},
	];

	console.log("Rendering all blocks to HTML...");

	try {
		// Render pages/blocks
		const html = await cms.renderBlocks(pageBlocks);
		console.log("\n--- Gerendertes HTML (Auszug) ---");
		console.log(html.substring(0, 500) + "\n...\n[Zusammengefasst]");
		console.log("----------------------------------");
		console.log(`Erfolgreich gerendert! Länge des HTML: ${html.length} Bytes`);
	} catch (error) {
		console.error("Fehler beim Rendern:", error);
	}
}

main();
