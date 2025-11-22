export type SupportedTarget = "tsx" | "jsx" | "vue" | "ts" | "js";

export interface FieldDefinition {
	type: string
	name: string
	label: string
	placeholder?: string
	required?: boolean
	options?: Array<{ label?: string, value?: string } | string>
	// Advanced-specific
	provider?: string
	siteKey?: string
	action?: string
	theme?: string
	size?: string
}

export interface FieldGenResult {
	// Snippets of UI for each target
	ui: Partial<Record<SupportedTarget, string>>
	// Field state declarations (hooks/refs or variables)
	state?: Partial<Record<SupportedTarget, string>>
	// Code to collect value into an object named formData
	collect?: Partial<Record<SupportedTarget, string>>
	// Validation checks that set errors[name] or push to errors array
	validate?: Partial<Record<SupportedTarget, string>>
}

function sanitizeName(name: string): string {
	return (name || "field").replace(/\W/g, "_");
}

function q(s?: string): string {
	return (s ?? "").replace(/"/g, "\\\"");
}

// Simple validators shared across targets
function requiredCheckExpr(target: SupportedTarget, varName: string): string {
	if (target === "vue") return `if (!${varName} || ${varName}.length === 0) errors.${varName}Name = "This field is required"`;
	if (target === "ts" || target === "js") return `if (!${varName} || ${varName}.length === 0) errors["${varName}"] = "This field is required"`;
	return `if (!${varName} || ${varName}.length === 0) errors.${varName} = "This field is required"`;
}

function emailCheckExpr(target: SupportedTarget, varName: string): string {
	const test = `/^\\S+@\\S+\\.\\S+$/.test(${varName})`;
	if (target === "vue") return `if (${varName} && !${test}) errors.${varName}Name = "Invalid email"`;
	if (target === "ts" || target === "js") return `if (${varName} && !${test}) errors["${varName}"] = "Invalid email"`;
	return `if (${varName} && !${test}) errors.${varName} = "Invalid email"`;
}

function numberCheckExpr(target: SupportedTarget, varName: string): string {
	const test = `!Number.isFinite(Number(${varName}))`;
	if (target === "vue") return `if (${varName} && ${test}) errors.${varName}Name = "Must be a number"`;
	if (target === "ts" || target === "js") return `if (${varName} && ${test}) errors["${varName}"] = "Must be a number"`;
	return `if (${varName} && ${test}) errors.${varName} = "Must be a number"`;
}

// Registry for basic and advanced fields
export const FieldRegistry: Record<string, (f: FieldDefinition, target: SupportedTarget) => FieldGenResult> = {
  text: (f, _target) => {
		const n = sanitizeName(f.name || f.label);
		const base = {
			tsx: `<label><span>${q(f.label)}</span><input type="text" value={${n}} onChange={e=>set${n}(e.target.value)} placeholder="${q(f.placeholder)}" /></label>`,
			jsx: `<label><span>${q(f.label)}</span><input type="text" value={${n}} onChange={e=>set${n}(e.target.value)} placeholder="${q(f.placeholder)}" /></label>`,
			vue: `<label><span>${q(f.label)}</span><input type="text" v-model="${n}" placeholder="${q(f.placeholder)}" /></label>`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState("")`,
			jsx: `const [${n}, set${n}] = React.useState("")`,
			vue: `const ${n} = ref("")`,
			ts: `let ${n} = "";`,
			js: `let ${n} = "";`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}`,
			jsx: `formData["${n}"] = ${n}`,
			vue: `formData["${n}"] = ${n}.value`,
			ts: `formData["${n}"] = ${n}`,
			js: `formData["${n}"] = ${n}`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {};
		if (f.required) {
			validate.tsx = requiredCheckExpr("tsx", n);
			validate.jsx = requiredCheckExpr("jsx", n);
			validate.vue = requiredCheckExpr("vue", `${n}.value`);
			validate.ts = requiredCheckExpr("ts", n);
			validate.js = requiredCheckExpr("js", n);
		}
		return { ui: base, state, collect, validate };
	},

  email: (f, _target) => {
		const n = sanitizeName(f.name || f.label);
		const base = {
			tsx: `<label><span>${q(f.label)}</span><input type="email" value={${n}} onChange={e=>set${n}(e.target.value)} placeholder="${q(f.placeholder)}" /></label>`,
			jsx: `<label><span>${q(f.label)}</span><input type="email" value={${n}} onChange={e=>set${n}(e.target.value)} placeholder="${q(f.placeholder)}" /></label>`,
			vue: `<label><span>${q(f.label)}</span><input type="email" v-model="${n}" placeholder="${q(f.placeholder)}" /></label>`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState("")`,
			jsx: `const [${n}, set${n}] = React.useState("")`,
			vue: `const ${n} = ref("")`,
			ts: `let ${n} = "";`,
			js: `let ${n} = "";`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}`,
			jsx: `formData["${n}"] = ${n}`,
			vue: `formData["${n}"] = ${n}.value`,
			ts: `formData["${n}"] = ${n}`,
			js: `formData["${n}"] = ${n}`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {
			tsx: emailCheckExpr("tsx", n),
			jsx: emailCheckExpr("jsx", n),
			vue: emailCheckExpr("vue", `${n}.value`),
			ts: emailCheckExpr("ts", n),
			js: emailCheckExpr("js", n)
		};
		if (f.required) {
			validate.tsx = `${requiredCheckExpr("tsx", n)}\n${validate.tsx}`;
			validate.jsx = `${requiredCheckExpr("jsx", n)}\n${validate.jsx}`;
			validate.vue = `${requiredCheckExpr("vue", `${n}.value`)}\n${validate.vue}`;
			validate.ts = `${requiredCheckExpr("ts", n)}\n${validate.ts}`;
			validate.js = `${requiredCheckExpr("js", n)}\n${validate.js}`;
		}
		return { ui: base, state, collect, validate };
	},

password: (f) => FieldRegistry.text({ ...(f as any), type: "password" } as FieldDefinition, "tsx"),
	number: (f) => {
		const n = sanitizeName(f.name || f.label);
		const base = {
			tsx: `<label><span>${q(f.label)}</span><input type="number" value={${n}} onChange={e=>set${n}(e.target.value)} placeholder="${q(f.placeholder)}" /></label>`,
			jsx: `<label><span>${q(f.label)}</span><input type="number" value={${n}} onChange={e=>set${n}(e.target.value)} placeholder="${q(f.placeholder)}" /></label>`,
			vue: `<label><span>${q(f.label)}</span><input type="number" v-model="${n}" placeholder="${q(f.placeholder)}" /></label>`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState("")`,
			jsx: `const [${n}, set${n}] = React.useState("")`,
			vue: `const ${n} = ref("")`,
			ts: `let ${n} = "";`,
			js: `let ${n} = "";`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n} === "" ? null : Number(${n})`,
			jsx: `formData["${n}"] = ${n} === "" ? null : Number(${n})`,
			vue: `formData["${n}"] = ${n}.value === "" ? null : Number(${n}.value)`,
			ts: `formData["${n}"] = ${n} === "" ? null : Number(${n})`,
			js: `formData["${n}"] = ${n} === "" ? null : Number(${n})`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {
			tsx: numberCheckExpr("tsx", n),
			jsx: numberCheckExpr("jsx", n),
			vue: numberCheckExpr("vue", `${n}.value`),
			ts: numberCheckExpr("ts", n),
			js: numberCheckExpr("js", n)
		};
		if (f.required) {
			validate.tsx = `${requiredCheckExpr("tsx", n)}\n${validate.tsx}`;
			validate.jsx = `${requiredCheckExpr("jsx", n)}\n${validate.jsx}`;
			validate.vue = `${requiredCheckExpr("vue", `${n}.value`)}\n${validate.vue}`;
			validate.ts = `${requiredCheckExpr("ts", n)}\n${validate.ts}`;
			validate.js = `${requiredCheckExpr("js", n)}\n${validate.js}`;
		}
		return { ui: base, state, collect, validate };
	},

textarea: (f) => FieldRegistry.text({ ...(f as any), type: "textarea" } as FieldDefinition, "tsx"),

	select: (f) => {
		const n = sanitizeName(f.name || f.label);
		const opts = (f.options || []).map((o) => typeof o === "string" ? { label: o, value: o } : o);
		const optionsHtml = opts.map((o) => `<option value="${q(o?.value || "")}">${q(o?.label || o?.value || "")}</option>`).join("\n        ");
		const base = {
			tsx: `<label><span>${q(f.label)}</span><select value={${n}} onChange={e=>set${n}(e.target.value)}>${optionsHtml}</select></label>`,
			jsx: `<label><span>${q(f.label)}</span><select value={${n}} onChange={e=>set${n}(e.target.value)}>${optionsHtml}</select></label>`,
			vue: `<label><span>${q(f.label)}</span><select v-model="${n}">${optionsHtml}</select></label>`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState("")`,
			jsx: `const [${n}, set${n}] = React.useState("")`,
			vue: `const ${n} = ref("")`,
			ts: `let ${n} = "";`,
			js: `let ${n} = "";`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}`,
			jsx: `formData["${n}"] = ${n}`,
			vue: `formData["${n}"] = ${n}.value`,
			ts: `formData["${n}"] = ${n}`,
			js: `formData["${n}"] = ${n}`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {};
		if (f.required) {
			validate.tsx = requiredCheckExpr("tsx", n);
			validate.jsx = requiredCheckExpr("jsx", n);
			validate.vue = requiredCheckExpr("vue", `${n}.value`);
			validate.ts = requiredCheckExpr("ts", n);
			validate.js = requiredCheckExpr("js", n);
		}
		return { ui: base, state, collect, validate };
	},

	checkbox: (f) => {
		const n = sanitizeName(f.name || f.label);
		const base = {
			tsx: `<label><input type="checkbox" checked={${n}} onChange={e=>set${n}(e.target.checked)} /> ${q(f.label)}</label>`,
			jsx: `<label><input type="checkbox" checked={${n}} onChange={e=>set${n}(e.target.checked)} /> ${q(f.label)}</label>`,
			vue: `<label><input type="checkbox" v-model="${n}" /> ${q(f.label)}</label>`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState(false)`,
			jsx: `const [${n}, set${n}] = React.useState(false)`,
			vue: `const ${n} = ref(false)`,
			ts: `let ${n} = false;`,
			js: `let ${n} = false;`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}`,
			jsx: `formData["${n}"] = ${n}`,
			vue: `formData["${n}"] = ${n}.value`,
			ts: `formData["${n}"] = ${n}`,
			js: `formData["${n}"] = ${n}`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {};
    if (f.required) {
      validate.tsx = `if (!${n}) errors["${n}"] = "This field is required"`;
      validate.jsx = `if (!${n}) errors["${n}"] = "This field is required"`;
      validate.vue = `if (!${n}.value) errors.${n}Name = "This field is required"`;
      validate.ts = `if (!${n}) errors["${n}"] = "This field is required"`;
      validate.js = `if (!${n}) errors["${n}"] = "This field is required"`;
    }
		return { ui: base, state, collect, validate };
	},

	radio: (f) => {
		const n = sanitizeName(f.name || f.label);
		const opts = (f.options || []).map((o) => typeof o === "string" ? { label: o, value: o } : o);
		const radiosTsx = opts.map((o, i) => `<label><input type="radio" name="${n}" checked={${n} === "${q(o?.value || String(i))}" onChange={() => set${n}("${q(o?.value || String(i))}")} /> ${q(o?.label || o?.value || String(i))}</label>`).join(" ");
		const radiosVue = opts.map((o, i) => `<label><input type="radio" name="${n}" :checked="${n} === '${q(o?.value || String(i))}'" @change="${n}='${q(o?.value || String(i))}'" /> ${q(o?.label || o?.value || String(i))}</label>`).join(" ");
		const base = {
			tsx: `<fieldset><legend>${q(f.label)}</legend>${radiosTsx}</fieldset>`,
			jsx: `<fieldset><legend>${q(f.label)}</legend>${radiosTsx}</fieldset>`,
			vue: `<fieldset><legend>${q(f.label)}</legend>${radiosVue}</fieldset>`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState("")`,
			jsx: `const [${n}, set${n}] = React.useState("")`,
			vue: `const ${n} = ref("")`,
			ts: `let ${n} = "";`,
			js: `let ${n} = "";`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}`,
			jsx: `formData["${n}"] = ${n}`,
			vue: `formData["${n}"] = ${n}.value`,
			ts: `formData["${n}"] = ${n}`,
			js: `formData["${n}"] = ${n}`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {};
		if (f.required) {
			validate.tsx = requiredCheckExpr("tsx", n);
			validate.jsx = requiredCheckExpr("jsx", n);
			validate.vue = requiredCheckExpr("vue", `${n}.value`);
			validate.ts = requiredCheckExpr("ts", n);
			validate.js = requiredCheckExpr("js", n);
		}
		return { ui: base, state, collect, validate };
	},

	date: (f) => FieldRegistry.text({ ...f, type: "date" } as FieldDefinition, "tsx"),

	// Advanced fields (simplified baseline implementations)
	"file-upload": (f) => {
		const n = sanitizeName(f.name || f.label);
		const base = {
			tsx: `<label><span>${q(f.label)}</span><input type="file" onChange={e=>set${n}(e.target.files)} /></label>`,
			jsx: `<label><span>${q(f.label)}</span><input type="file" onChange={e=>set${n}(e.target.files)} /></label>`,
			vue: `<FileUploadField v-model="${n}" :label="'${q(f.label || 'File Upload')}'" />`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState<FileList | null>(null)`,
			jsx: `const [${n}, set${n}] = React.useState(null)`,
			vue: `const ${n} = ref<FileList | null>(null as any)`,
			ts: `let ${n}: FileList | null = null;`,
			js: `let ${n} = null;`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}`,
			jsx: `formData["${n}"] = ${n}`,
			vue: `formData["${n}"] = ${n}.value`,
			ts: `formData["${n}"] = ${n}`,
			js: `formData["${n}"] = ${n}`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {};
		if (f.required) {
			validate.tsx = `if (!${n} || ${n}.length === 0) errors.${n} = "Please upload a file"`;
			validate.jsx = `if (!${n} || ${n}.length === 0) errors.${n} = "Please upload a file"`;
			validate.vue = `if (!${n}.value || ${n}.value.length === 0) errors.${n}Name = "Please upload a file"`;
			validate.ts = `if (!${n} || ${n}.length === 0) errors["${n}"] = "Please upload a file"`;
			validate.js = `if (!${n} || ${n}.length === 0) errors["${n}"] = "Please upload a file"`;
		}
		return { ui: base, state, collect, validate };
	},

	"date-picker": (f) => {
		const n = sanitizeName(f.name || f.label);
		const base = {
			tsx: FieldRegistry.text({ ...f, type: "date" } as any, "tsx").ui.tsx!,
			jsx: FieldRegistry.text({ ...f, type: "date" } as any, "jsx").ui.jsx!,
			vue: `<DatePickerField v-model="${n}" :label="'${q(f.label || 'Date')}'" />`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState("")`,
			jsx: `const [${n}, set${n}] = React.useState("")`,
			vue: `const ${n} = ref("")`,
			ts: `let ${n} = "";`,
			js: `let ${n} = "";`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}`,
			jsx: `formData["${n}"] = ${n}`,
			vue: `formData["${n}"] = ${n}.value`,
			ts: `formData["${n}"] = ${n}`,
			js: `formData["${n}"] = ${n}`
		};
		return { ui: base, state, collect };
	},

	rating: (f) => {
		const n = sanitizeName(f.name || f.label);
		const base = {
			tsx: `<label><span>${q(f.label)}</span><input type="range" min="1" max="5" value={${n}} onChange={e=>set${n}(e.target.value)} /></label>`,
			jsx: `<label><span>${q(f.label)}</span><input type="range" min="1" max="5" value={${n}} onChange={e=>set${n}(e.target.value)} /></label>`,
			vue: `<RatingField v-model="${n}" :label="'${q(f.label || 'Rating')}'" />`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState("3")`,
			jsx: `const [${n}, set${n}] = React.useState("3")`,
			vue: `const ${n} = ref("3")`,
			ts: `let ${n} = "3";`,
			js: `let ${n} = "3";`
		};
		const collect = {
			tsx: `formData["${n}"] = Number(${n})`,
			jsx: `formData["${n}"] = Number(${n})`,
			vue: `formData["${n}"] = Number(${n}.value)`,
			ts: `formData["${n}"] = Number(${n})`,
			js: `formData["${n}"] = Number(${n})`
		};
		return { ui: base, state, collect };
	},

	"color-picker": (f) => {
		const n = sanitizeName(f.name || f.label);
		const base = {
			tsx: `<label><span>${q(f.label)}</span><input type="color" value={${n}} onChange={e=>set${n}(e.target.value)} /></label>`,
			jsx: `<label><span>${q(f.label)}</span><input type="color" value={${n}} onChange={e=>set${n}(e.target.value)} /></label>`,
			vue: `<ColorPickerField v-model="${n}" :label="'${q(f.label || 'Color')}'" />`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState("#3366ff")`,
			jsx: `const [${n}, set${n}] = React.useState("#3366ff")`,
			vue: `const ${n} = ref("#3366ff")`,
			ts: `let ${n} = "#3366ff";`,
			js: `let ${n} = "#3366ff";`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}`,
			jsx: `formData["${n}"] = ${n}`,
			vue: `formData["${n}"] = ${n}.value`,
			ts: `formData["${n}"] = ${n}`,
			js: `formData["${n}"] = ${n}`
		};
		return { ui: base, state, collect };
	},

	signature: (f) => {
		const n = sanitizeName(f.name || f.label);
		const base = {
			tsx: `<div><span>${q(f.label)}</span><canvas ref={${n}CanvasRef} width={400} height={200} className="border" /></div>`,
			jsx: `<div><span>${q(f.label)}</span><canvas ref={${n}CanvasRef} width={400} height={200} className="border" /></div>`,
			vue: `<SignatureField v-model="${n}" :label="'${q(f.label || 'Signature')}'" />`
		};
		const state = {
			tsx: `const ${n}CanvasRef = React.useRef<HTMLCanvasElement | null>(null)`,
			jsx: `const ${n}CanvasRef = React.useRef(null)`,
			vue: `const ${n}CanvasRef = ref<HTMLCanvasElement | null>(null as any)`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}CanvasRef.current ? ${n}CanvasRef.current.toDataURL() : ""`,
			jsx: `formData["${n}"] = ${n}CanvasRef.current ? ${n}CanvasRef.current.toDataURL() : ""`,
			vue: `formData["${n}"] = ${n}CanvasRef.value ? ${n}CanvasRef.value.toDataURL() : ""`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {};
		if (f.required) {
			validate.tsx = `if (!formData["${n}"]) errors.${n} = "Please provide a signature"`;
			validate.jsx = `if (!formData["${n}"]) errors.${n} = "Please provide a signature"`;
			validate.vue = `if (!formData["${n}"]) errors.${n}Name = "Please provide a signature"`;
			validate.ts = `if (!formData["${n}"]) errors["${n}"] = "Please provide a signature"`;
			validate.js = `if (!formData["${n}"]) errors["${n}"] = "Please provide a signature"`;
		}
		return { ui: base, state, collect, validate };
	},

	"multi-select": (f) => {
		const n = sanitizeName(f.name || f.label);
		const opts = (f.options || []).map((o) => typeof o === "string" ? { label: o, value: o } : o);
		const optionsHtml = opts.map((o) => `<option value="${q(o?.value || "")}">${q(o?.label || o?.value || "")}</option>`).join("\n        ");
		const base = {
			tsx: `<label><span>${q(f.label)}</span><select multiple value={${n}} onChange={e=>set${n}(Array.from(e.target.selectedOptions).map(o=>o.value))}>${optionsHtml}</select></label>`,
			jsx: `<label><span>${q(f.label)}</span><select multiple value={${n}} onChange={e=>set${n}(Array.from(e.target.selectedOptions).map(o=>o.value))}>${optionsHtml}</select></label>`,
			vue: `<MultiSelectField v-model="${n}" :label="'${q(f.label || 'Select')}'" :options='${JSON.stringify(opts)}' />`
		};
		const state = {
			tsx: `const [${n}, set${n}] = React.useState<string[]>([])`,
			jsx: `const [${n}, set${n}] = React.useState([])`,
			vue: `const ${n} = ref<string[] | any[]>([] as any)`,
			ts: `let ${n}: any[] = [];`,
			js: `let ${n} = [];`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}`,
			jsx: `formData["${n}"] = ${n}`,
			vue: `formData["${n}"] = ${n}.value`,
			ts: `formData["${n}"] = ${n}`,
			js: `formData["${n}"] = ${n}`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {};
		if (f.required) {
			validate.tsx = `if (!${n} || ${n}.length === 0) errors.${n} = "Please select at least one option"`;
			validate.jsx = `if (!${n} || ${n}.length === 0) errors.${n} = "Please select at least one option"`;
			validate.vue = `if (!${n}.value || ${n}.value.length === 0) errors.${n}Name = "Please select at least one option"`;
			validate.ts = `if (!${n} || ${n}.length === 0) errors["${n}"] = "Please select at least one option"`;
			validate.js = `if (!${n} || ${n}.length === 0) errors["${n}"] = "Please select at least one option"`;
		}
		return { ui: base, state, collect, validate };
	},

	recaptcha: (f) => {
		const n = sanitizeName(f.name || "recaptcha");
		const base = {
			tsx: `<div className="recaptcha"><span>${q(f.label || "reCAPTCHA")}</span><div id="${n}-container" /></div>`,
			jsx: `<div className="recaptcha"><span>${q(f.label || "reCAPTCHA")}</span><div id="${n}-container" /></div>`,
			vue: `<RecaptchaField v-model="${n}Token" :provider="'${q(f.provider || 'google')}'" :site-key="'${q(f.siteKey || '')}'" />`
		};
		const state = {
			tsx: `const [${n}Token, set${n}Token] = React.useState("")`,
			jsx: `const [${n}Token, set${n}Token] = React.useState("")`,
			vue: `const ${n}Token = ref("")`,
			ts: `let ${n}Token = "";`,
			js: `let ${n}Token = "";`
		};
		const collect = {
			tsx: `formData["${n}"] = ${n}Token`,
			jsx: `formData["${n}"] = ${n}Token`,
			vue: `formData["${n}"] = ${n}Token.value`,
			ts: `formData["${n}"] = ${n}Token`,
			js: `formData["${n}"] = ${n}Token`
		};
		const validate: Partial<Record<SupportedTarget, string>> = {};
		if (f.required !== false) {
			validate.tsx = `if (!${n}Token) errors.${n} = "Verification required"`;
			validate.jsx = `if (!${n}Token) errors.${n} = "Verification required"`;
			validate.vue = `if (!${n}Token.value) errors.${n}Name = "Verification required"`;
			validate.ts = `if (!${n}Token) errors["${n}"] = "Verification required"`;
			validate.js = `if (!${n}Token) errors["${n}"] = "Verification required"`;
		}
		return { ui: base, state, collect, validate };
	}
};
