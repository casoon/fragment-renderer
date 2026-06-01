import { createAstroRuntime } from "@casoon/fragment-renderer";
import ProductList from "../../../components/ProductList.astro";

export const prerender = false;

const runtime = createAstroRuntime();

// Helper to generate mock products
function getMockProducts(page: number) {
	const itemsPerPage = 3;
	const allProducts = [
		{ id: 1, name: "Schwarzer Kaffee", price: "2.50 €", description: "Frisch gebrühter Filterkaffee." },
		{ id: 2, name: "Cappuccino", price: "3.20 €", description: "Espresso mit cremigem Milchschaum." },
		{ id: 3, name: "Latte Macchiato", price: "3.80 €", description: "Dreischichtiger Espresso-Milch-Traum." },
		{ id: 4, name: "Croissant", price: "1.80 €", description: "Buttriges, französisches Gebäck." },
		{ id: 5, name: "Blaubeer-Muffin", price: "2.40 €", description: "Saftiger Muffin mit vielen Beeren." },
		{ id: 6, name: "Käsekuchen", price: "3.00 €", description: "Nach traditionellem Rezept gebacken." },
		{ id: 7, name: "Tee (Grün)", price: "2.80 €", description: "Feiner Sencha aus kontrolliertem Anbau." },
		{ id: 8, name: "Heisse Schokolade", price: "3.50 €", description: "Mit echter Vollmilchschokolade zubereitet." },
		{ id: 9, name: "Wasser (Sprudel)", price: "2.00 €", description: "Erfrischendes Mineralwasser." },
	];

	const start = (page - 1) * itemsPerPage;
	const end = start + itemsPerPage;

	return {
		products: allProducts.slice(start, end),
		totalPages: Math.ceil(allProducts.length / itemsPerPage),
	};
}

export async function GET({ params }) {
	const page = Number.parseInt(params.page) || 1;
	const { products, totalPages } = getMockProducts(page);

	// Render to Response helper
	return runtime.renderToResponse(ProductList, {
		products,
		currentPage: page,
		totalPages,
	});
}
