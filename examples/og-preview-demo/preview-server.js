import { createServer } from "node:http";
import { createAstroRuntime } from "@casoon/fragment-renderer";
import OGCard from "./templates/OGCard.astro";

const PORT = 3003;

const runtime = createAstroRuntime({
	baseContext: { channel: "og" },
});

const server = createServer(async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);

	if (url.pathname === "/favicon.ico") {
		res.writeHead(404);
		res.end();
		return;
	}

	try {
		// Read values from query parameters
		const title = url.searchParams.get("title") || "Standard-Titel für OG-Card";
		const description = url.searchParams.get("description") || "Hier steht eine kurze Beschreibung des Beitrags.";
		const author = url.searchParams.get("author") || "Max Mustermann";
		const date = url.searchParams.get("date") || "01.06.2026";
		const accentColor = url.searchParams.get("accent") || "#3b82f6";

		console.log(`Rendering OG Card for title: "${title}"`);

		const html = await runtime.renderComponent(OGCard, {
			title,
			description,
			author,
			date,
			bgColor: "#0f172a",
			accentColor,
		});

		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		res.end(html);
	} catch (error) {
		console.error("OG Card render error:", error);
		res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		res.end(`Fehler beim Rendern der OG-Card: ${error.message}`);
	}
});

server.listen(PORT, () => {
	console.log(`OG Card Preview-Server läuft unter http://localhost:${PORT}`);
	console.log("Beispiel-URLs zum Testen:");
	console.log(`- http://localhost:${PORT}/?title=Mein+erster+Blogbeitrag&author=Erika+Muster&accent=%23f43f5e`);
	console.log(`- http://localhost:${PORT}/?title=Erweiterter+Guide+zu+Astro&accent=%2310b981`);
});
