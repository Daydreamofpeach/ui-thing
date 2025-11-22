export interface FormData {
	id: string
	title?: string
	description?: string
	html?: string
	css?: string
	json?: any
}

const escapeHtml = (str: string): string => {
	if (!str) return "";
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
};

const fieldToHtml = (field: any): string => {
	const name = escapeHtml(field.name || field.label || "field");
	const label = escapeHtml(field.label || name);
	const placeholder = escapeHtml(field.placeholder || "");
	const required = field.required ? " required" : "";

	switch ((field.type || "text").toLowerCase()) {
		case "textarea":
			return `<label>${label}<textarea name="${name}" placeholder="${placeholder}"${required}></textarea></label>`;
		case "select":
			return `<label>${label}<select name="${name}"${required}>${(field.options || []).map((o: any) => `<option value="${escapeHtml(o.value || "")}">${escapeHtml(o.label || o.value || "")}</option>`).join("")}</select></label>`;
		case "checkbox":
			return `<label style="flex-direction: row; align-items: center;"><input type="checkbox" name="${name}"${required}/> ${label}</label>`;
		case "radio":
			return `<fieldset><legend>${label}</legend>${(field.options || []).map((o: any, i: number) => `<label style="flex-direction: row; align-items: center;"><input type="radio" name="${name}" value="${escapeHtml(o.value || String(i))}"${required}/> ${escapeHtml(o.label || o.value || String(i))}</label>`).join(" ")}</fieldset>`;
		case "email":
			return `<label>${label}<input type="email" name="${name}" placeholder="${placeholder}"${required}/></label>`;
		case "number":
			return `<label>${label}<input type="number" name="${name}" placeholder="${placeholder}"${required}/></label>`;
		case "password":
			return `<label>${label}<input type="password" name="${name}" placeholder="${placeholder}"${required}/></label>`;
		case "date":
			return `<label>${label}<input type="date" name="${name}"${required}/></label>`;
		case "tel":
			return `<label>${label}<input type="tel" name="${name}" placeholder="${placeholder}"${required}/></label>`;
		case "url":
			return `<label>${label}<input type="url" name="${name}" placeholder="${placeholder}"${required}/></label>`;
		case "rating":
			return `<label>${label}
			<div style="display: flex; gap: 4px; margin-top: 8px;">
				${Array.from({ length: 5 }, (_, i) => `
					<input type="radio" name="${name}" value="${i + 1}"${required} id="${name}-star-${i + 1}" style="display: none;">
					<label for="${name}-star-${i + 1}" style="cursor: pointer; font-size: 32px; color: #fbbf24; transition: all 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">★</label>
				`).join("")}
			</div>
		</label>`;
		case "recaptcha":
			return `<div style="background: #f7fafc; border: 2px dashed #cbd5e0; border-radius: 8px; padding: 24px; text-align: center; color: #718096; margin: 16px 0;">
			<p style="margin: 0 0 8px 0; font-weight: 600;">reCAPTCHA Placeholder</p>
			<small style="color: #a0aec0;">In production, this would display a reCAPTCHA widget</small>
		</div>`;
		default:
			return `<label>${label}<input type="text" name="${name}" placeholder="${placeholder}"${required}/></label>`;
	}
};

const generateFormHtmlFromJson = (json: any): string => {
	if (!json || !json.fields) {
		return "<form class=\"buildit-form\"><p style=\"text-align: center; color: #718096;\">No form data available</p></form>";
	}
	const fieldsHtml = json.fields.map((field: any) => fieldToHtml(field)).join("\n\t");
	return `<form class="buildit-form">
	${fieldsHtml}
	<button type="submit" class="btn">${escapeHtml(json.submitLabel || "Submit")}</button>
</form>`;
};

const getDefaultFormCss = (): string => {
	return `
	/* Additional custom form styles */
	`;
};

export const generateFormPreviewHtml = (form: FormData): string => {
	const formHtml = form.html || generateFormHtmlFromJson(form.json);
	const formCss = form.css || getDefaultFormCss();
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${escapeHtml(form.title || "Form Preview")}</title>
	<style>
		/* styles trimmed for brevity; copied from client */
		${formCss}
	</style>
</head>
<body>
	<div class="preview-container">
		<div class="preview-header">
			<h1>${escapeHtml(form.title || "Form Preview")}</h1>
			<p>${escapeHtml(form.description || "Interactive form preview - Fill out and submit to test")}</p>
			<span class="preview-badge">🔴 Live Preview</span>
		</div>
		${formHtml}
		<div id="success-message" class="success-message">✓ Form submitted successfully! Check the console for submitted data.</div>
	</div>
	<script>
		const form = document.querySelector('.buildit-form');
		if (form) {
			form.addEventListener('submit', function(e) {
				e.preventDefault();
				const formData = new FormData(e.target);
				const data = Object.fromEntries(formData.entries());
				try {
					const messageData = { type: 'BUILDIT_FORM_SUBMISSION', formData: data, formAction: form.action || window.location.href, formMethod: form.method || 'POST' };
					if (window.parent && window.parent !== window) window.parent.postMessage(messageData, '*');
					if (window.top && window.top !== window) window.top.postMessage(messageData, '*');
					if (window.parent === window) window.postMessage(messageData, '*');
				} catch (error) {}
				const successMsg = document.getElementById('success-message');
				if (successMsg) { successMsg.classList.add('show'); setTimeout(() => { successMsg.classList.remove('show'); }, 3000); }
			});
		}
	</script>
</body>
</html>`;
};

export const createFormPreviewUrl = (form: FormData): string => {
	const html = generateFormPreviewHtml(form);
	const blob = new Blob([html], { type: "text/html" });
	return URL.createObjectURL(blob);
};

