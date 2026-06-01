import { beforeEach, describe, expect, test, vi } from "vitest";
import { ahaStackPreset } from "./presets/aha-stack.js";
import { cmsPreset } from "./presets/cms.js";
import { emailPreset } from "./presets/email.js";
import { createAstroRuntime } from "./runtime.js";

// Mock the astro/container module to avoid needing a full Astro environment during unit tests
vi.mock("astro/container", () => {
	const mockRenderToString = vi
		.fn()
		.mockImplementation((component, _options) => {
			return Promise.resolve(
				`<rendered>${component.name || "Component"}</rendered>`,
			);
		});

	return {
		experimental_AstroContainer: {
			create: vi.fn().mockImplementation(() => {
				return Promise.resolve({
					renderToString: mockRenderToString,
				});
			}),
		},
	};
});

describe("AstroRuntime Core & Registry Tests", () => {
	// biome-ignore lint/suspicious/noExplicitAny: mock component for testing
	let mockComponent: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockComponent = { name: "MockComponent" };
	});

	test("should create runtime instance with default settings", () => {
		const runtime = createAstroRuntime();
		expect(runtime).toBeDefined();
		expect(runtime.getBaseContext()).toEqual({
			locale: undefined,
			channel: "web",
		});
	});

	test("should manage base context", () => {
		const runtime = createAstroRuntime({
			baseContext: { locale: "de", channel: "pdf" },
		});
		expect(runtime.getBaseContext()).toEqual({ locale: "de", channel: "pdf" });

		runtime.setBaseContext({
			locale: "en-US",
			channel: "email",
			theme: "dark",
		});
		expect(runtime.getBaseContext()).toEqual({
			locale: "en-US",
			channel: "email",
			theme: "dark",
		});
	});

	test("should register and list components", () => {
		const runtime = createAstroRuntime();
		const loader = () => Promise.resolve({ default: mockComponent });

		runtime.registerComponent("btn", loader, {
			category: "ui",
			tags: ["interactive"],
		});
		expect(runtime.hasComponent("btn")).toBe(true);
		expect(runtime.getComponent("btn")).toEqual({
			id: "btn",
			loader,
			meta: { category: "ui", tags: ["interactive"] },
			styles: undefined,
		});

		const list = runtime.listComponents();
		expect(list.length).toBe(1);
		expect(list[0].id).toBe("btn");
	});

	test("should support optional styles in registerComponent", () => {
		const runtime = createAstroRuntime();
		const loader = () => Promise.resolve({ default: mockComponent });
		const customStyles = ".btn { color: red; }";

		runtime.registerComponent("btn", loader, { category: "ui" }, customStyles);
		expect(runtime.getComponent("btn")?.styles).toBe(customStyles);
	});

	test("should bulk register components", () => {
		const runtime = createAstroRuntime();
		const loader = () => Promise.resolve({ default: mockComponent });

		runtime.registerComponents([
			{ id: "input", loader, meta: { category: "form", tags: ["input"] } },
			{ id: "label", loader, meta: { category: "form", tags: ["text"] } },
		]);

		expect(runtime.hasComponent("input")).toBe(true);
		expect(runtime.hasComponent("label")).toBe(true);
		expect(runtime.listComponents().length).toBe(2);
	});

	test("should filter components by meta values", () => {
		const runtime = createAstroRuntime();
		const loader = () => Promise.resolve({ default: mockComponent });

		runtime.registerComponents([
			{
				id: "input",
				loader,
				meta: { category: "form", tags: ["interactive", "text"] },
			},
			{ id: "hero", loader, meta: { category: "layout", tags: ["hero"] } },
		]);

		const forms = runtime.listComponents({ category: "form" });
		expect(forms.length).toBe(1);
		expect(forms[0].id).toBe("input");

		const inter = runtime.listComponents({ tag: "interactive" });
		expect(inter.length).toBe(1);
		expect(inter[0].id).toBe("input");

		const multiTags = runtime.listComponents({ tags: ["interactive", "text"] });
		expect(multiTags.length).toBe(1);

		const unmatchedTags = runtime.listComponents({
			tags: ["interactive", "hero"],
		});
		expect(unmatchedTags.length).toBe(0);
	});

	test("should unregister components", () => {
		const runtime = createAstroRuntime();
		const loader = () => Promise.resolve({ default: mockComponent });

		runtime.registerComponent("test", loader);
		expect(runtime.hasComponent("test")).toBe(true);

		const result = runtime.unregisterComponent("test");
		expect(result).toBe(true);
		expect(runtime.hasComponent("test")).toBe(false);
	});
});

describe("AstroRuntime Service Registry Tests", () => {
	test("should register and dynamically invoke services", async () => {
		const runtime = createAstroRuntime();
		const mockService = { log: vi.fn() };

		runtime.registerService("logger", (rt) => {
			expect(rt).toBe(runtime);
			return mockService;
		});

		expect(runtime.hasService("logger")).toBe(true);
		const service = await runtime.getService<typeof mockService>("logger");
		expect(service).toBe(mockService);

		// Cached service retrieval
		const service2 = await runtime.getService<typeof mockService>("logger");
		expect(service2).toBe(mockService);
	});

	test("should throw error for unregistered services", async () => {
		const runtime = createAstroRuntime();
		await expect(runtime.getService("undefined-service")).rejects.toThrow(
			'Service "undefined-service" not registered',
		);
	});
});

describe("AstroRuntime Render Operations", () => {
	// biome-ignore lint/suspicious/noExplicitAny: mock component for testing
	let mockComponent: any;

	beforeEach(() => {
		mockComponent = { name: "TestComp" };
	});

	test("should render component with merged context", async () => {
		const runtime = createAstroRuntime({
			baseContext: { locale: "en", channel: "web" },
		});

		const html = await runtime.renderComponent(
			mockComponent,
			{ title: "Hello" },
			{ channel: "pdf" },
		);
		expect(html).toContain("<rendered>TestComp</rendered>");
	});

	test("should render to Response object", async () => {
		const runtime = createAstroRuntime();
		const response = await runtime.renderToResponse(mockComponent, {
			theme: "light",
		});

		expect(response).toBeInstanceOf(Response);
		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe(
			"text/html; charset=utf-8",
		);
		const html = await response.text();
		expect(html).toBe("<rendered>TestComp</rendered>");
	});
});

describe("Presets Validation", () => {
	test("AHA-Stack preset matches configuration", async () => {
		const preset = ahaStackPreset({ locale: "de" });
		expect(preset.baseContext).toEqual({
			locale: "de",
			channel: "web",
			framework: "aha-stack",
			htmx: true,
		});
		expect(preset.services?.length).toBe(1);
		expect(preset.services?.[0].name).toBe("htmx");

		const runtime = createAstroRuntime({
			services: preset.services,
		});

		// biome-ignore lint/suspicious/noExplicitAny: service instance
		const htmxService: any = await runtime.getService("htmx");
		expect(htmxService.getResponseHeaders({ trigger: "updated" })).toEqual({
			"HX-Trigger": "updated",
		});

		const req = new Request("http://localhost", {
			headers: { "HX-Request": "true", "HX-Trigger": "btn" },
		});
		expect(htmxService.isHtmxRequest(req)).toBe(true);
		expect(htmxService.getTriggerInfo(req).id).toBe("btn");
	});

	test("Email preset matches configuration", async () => {
		const preset = emailPreset({ provider: "sendgrid" });
		expect(preset.baseContext?.channel).toBe("email");
		expect(preset.baseContext?.provider).toBe("sendgrid");
		expect(preset.services?.[0].name).toBe("email");

		const runtime = createAstroRuntime({
			services: preset.services,
		});

		// biome-ignore lint/suspicious/noExplicitAny: service instance
		const emailService: any = await runtime.getService("email");
		expect(emailService.getSafeStyles()).toContain("color");
		expect(emailService.wrapInEmailLayout("Content")).toContain("Content");
	});

	test("CMS preset matches configuration", async () => {
		const mockComp = { name: "CMSBlock" };
		const preset = cmsPreset({
			provider: "strapi",
			blocks: [
				{
					id: "blocks.hero",
					loader: () => Promise.resolve({ default: mockComp }),
				},
			],
		});

		expect(preset.baseContext?.isHeadless).toBe(true);
		expect(preset.components?.length).toBe(1);
		expect(preset.services?.[0].name).toBe("cms");

		const runtime = createAstroRuntime({
			components: preset.components,
			services: preset.services,
		});

		// biome-ignore lint/suspicious/noExplicitAny: service instance
		const cmsService: any = await runtime.getService("cms");
		expect(cmsService.hasBlock("hero")).toBe(true);
		expect(cmsService.listBlocks()).toEqual(["hero"]);
	});
});
