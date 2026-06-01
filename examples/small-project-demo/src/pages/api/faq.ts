import { createAstroRuntime } from "@casoon/fragment-renderer";
import FAQ from "../../components/FAQ.astro";

export const prerender = false;

const runtime = createAstroRuntime();

export async function GET() {
	const html = await runtime.renderComponent(FAQ, {
		title: "Häufig gestellte Fragen (HTMX geladen)",
		items: [
			{
				question: "Ist das hier wirklich Astro?",
				answer: "Ja! Die Komponente wird zur Laufzeit auf dem Server gerendert und als reiner HTML-Schnipsel ausgeliefert.",
			},
			{
				question: "Warum sollte ich den Fragment-Renderer nutzen?",
				answer: "Er ermöglicht es, dieselbe Astro-Komponente sowohl für den statischen Build als auch für dynamische HTMX-Endpoints zu nutzen, ohne doppelte Templates pflegen zu müssen.",
			},
			{
				question: "Funktioniert das auch mit CSS?",
				answer: "Absolut. Das Scoped CSS der Astro-Komponente wird vom Renderer verarbeitet.",
			},
		],
	});

	return new Response(html, {
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Cache-Control": "public, max-age=60",
		},
	});
}
