import { createServer } from "node:http";
import { createAstroRuntime } from "@casoon/fragment-renderer";
import { cmsPreset } from "@casoon/fragment-renderer/presets/cms";

const PORT = 3001;

// 1. Configure the CMS preset with block mappings
const preset = cmsPreset({
	provider: "contentful",
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

const server = createServer(async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);

	if (url.pathname === "/favicon.ico") {
		res.writeHead(404);
		res.end();
		return;
	}

	try {
		const cms = await runtime.getService("cms");

		// Simulate dynamic layout data based on path / page
		const pageBlocks = [
			{
				type: "hero",
				data: {
					title: "Dynamisches CMS Block Rendering",
					subtitle: "Ausgeliefert über ein einfaches Node.js-Backend.",
					ctaText: "Mehr erfahren",
					ctaHref: "/#features",
				},
			},
			{
				type: "feature-grid",
				data: {
					features: [
						{ title: "On-the-Fly", description: "Änderungen im CMS werden ohne Build sofort live gerendert." },
						{ title: "Caching", description: "Komponenten-Imports sind im Speicher gecacht für maximale Performance." },
						{ title: "Keine JS-Verschmutzung", description: "Nur sauber kompiliertes HTML wird an den Browser gesendet." },
					],
				},
			},
			{
				type: "testimonial",
				data: {
					quote: "Die Performance im Vergleich zu React Server-Side Rendering ist phänomenal.",
					author: "John Developer",
				},
			},
		];

		const blocksHtml = await cms.renderBlocks(pageBlocks);

		// Wrap the blocks inside a basic page layout wrapper
		const fullPageHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CMS Fragment Renderer Preview</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
    }
    header {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(10px);
      padding: 1rem;
      border-bottom: 1px solid #334155;
      position: sticky;
      top: 0;
      z-index: 100;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <strong>Astro Fragment Renderer Preview Server</strong> (Port ${PORT})
  </header>
  <main>
    ${blocksHtml}
  </main>
</body>
</html>`;

		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		res.end(fullPageHtml);
	} catch (error) {
		console.error("Renderer error:", error);
		res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		res.end(`Fehler beim Rendern: ${error.message}`);
	}
});

server.listen(PORT, () => {
	console.log(`CMS Demo-Server läuft unter http://localhost:${PORT}`);
});
