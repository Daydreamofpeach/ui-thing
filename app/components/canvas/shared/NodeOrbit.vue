<template>
	<div class="node-orbit" :class="{ 'node-orbit--animated': autoRotate }">
		<div class="node-orbit__backdrop" />
		<div class="node-orbit__center" :style="{ zIndex: centerZIndex }">
			<div class="node-orbit__pulse node-orbit__pulse--one" />
			<div class="node-orbit__pulse node-orbit__pulse--two" />
			<slot name="center" />
		</div>

		<div
			v-for="(ring, ringIndex) in ringItems"
			:key="ringIndex"
			class="node-orbit__ring"
			:style="getRingStyle(ring.radius, ringIndex)"
		>
			<!-- Active connection line -->
			<svg
				v-if="ring.items.some(item => item.id === activeId)"
				class="node-orbit__connection-line"
				:style="getConnectionLineStyle(ring.items[0], ring.radius)"
			>
				<line
					x1="50%"
					y1="50%"
					:x2="getConnectionLineX(ring.items[0])"
					:y2="getConnectionLineY(ring.items[0])"
					stroke="rgba(59, 130, 246, 0.6)"
					stroke-width="2"
					stroke-dasharray="5,5"
				/>
			</svg>

			<button
				v-for="(item, itemIndex) in ring.items"
				:key="item.id"
				type="button"
				class="node-orbit__item"
				:class="{
					'node-orbit__item--active': item.id === activeId,
					'node-orbit__item--disabled': item.disabled
				}"
				:style="getItemStyle(itemIndex, ring.items.length, ring.radius)"
				:title="item.tooltip || item.label"
				:aria-label="item.tooltip || item.label"
				@click="$emit('select', item)"
			>
				<span class="node-orbit__halo" :style="getHaloStyle(item)" />
				<div
					class="node-orbit__badge"
					:class="{ 'node-orbit__badge--active': item.id === activeId }"
					:style="getBadgeStyle(item)"
				>
					<div class="node-orbit__badge-content">
						<slot name="icon" :item="item">
							<UIcon
								v-if="item.icon"
								:name="item.icon"
								class="node-orbit__badge-icon"
								:class="{ 'node-orbit__badge-icon--active': item.id === activeId }"
								:style="getIconStyle(item)"
							/>
							<span v-else class="node-orbit__badge-initial">
								{{ (item.initial || item.label || "?" ).trim().charAt(0).toUpperCase() }}
							</span>
						</slot>
					</div>
				</div>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface OrbitItem {
	id: string
	icon?: string
	label: string
	color?: string
	disabled?: boolean
	tooltip?: string
	badgeGradient?: [string, string]
	haloColor?: string
	iconColor?: string
	initial?: string
	payload?: Record<string, any>
}

const props = withDefaults(defineProps<{
	items: OrbitItem[]
	activeId?: string | null
	centerIcon?: string
	autoRotate?: boolean
	size?: number
	startRadius?: number
	radiusStep?: number
	maxItemsPerRing?: number
	centerZIndex?: number
}>(), {
	items: () => [],
	activeId: null,
	centerIcon: "i-lucide-radar",
	autoRotate: true,
	size: 380,
	startRadius: 220,
	radiusStep: 150,
	maxItemsPerRing: 10,
	centerZIndex: 6
});

const centerIconName = computed(() => props.centerIcon || "i-lucide-radar");

const ringItems = computed(() => {
	const items = props.items ?? [];
	if (!items.length) {
		return [];
	}

	const badgeSize = 44;
	const padding = 32;
	const startRadius = Math.max(props.startRadius ?? 200, (badgeSize / 2) + padding);
	const step = Math.max(props.radiusStep ?? 150, badgeSize + padding);

	const hasExplicitRings = items.some((item) => typeof item.payload?.ringIndex === "number");

	if (hasExplicitRings) {
		const explicitGroups = new Map<number, { radius: number; items: OrbitItem[] }>();

		for (const item of items) {
			const ringIndex = Number(item.payload?.ringIndex ?? 0);
			let group = explicitGroups.get(ringIndex);

			if (!group) {
				const explicitRadius = typeof item.payload?.ringRadius === "number"
					? Number(item.payload.ringRadius)
					: startRadius + (ringIndex * step);

				group = {
					radius: explicitRadius,
					items: []
				};
				explicitGroups.set(ringIndex, group);
			}

			group.items.push(item);
		}

		return Array.from(explicitGroups.entries())
			.sort((a, b) => a[0] - b[0])
			.map(([, group]) => ({
				radius: group.radius,
				items: group.items.sort((a, b) => {
					const orderA = Number(a.payload?.chainOrder ?? 0);
					const orderB = Number(b.payload?.chainOrder ?? 0);
					return orderA - orderB;
				})
			}));
	}

	const groupOrder: Array<{ key: string, items: OrbitItem[] }> = [];
	const groupMap = new Map<string, OrbitItem[]>();

	for (const item of items) {
		const key = item.payload?.chainParent || item.id;
		let group = groupMap.get(key);
		if (!group) {
			group = [];
			groupMap.set(key, group);
			groupOrder.push({ key, items: group });
		}
		group.push(item);
	}

	groupOrder.forEach((group) => {
		group.items.sort((a, b) => {
			const orderA = Number(a.payload?.chainOrder ?? 0);
			const orderB = Number(b.payload?.chainOrder ?? 0);
			return orderA - orderB;
		});
	});

	return groupOrder.map((group, index) => ({
		radius: startRadius + (index * step),
		items: group.items
	}));
});

const baseOrbitColor = computed(() => props.defaultItemColor || "rgba(59, 130, 246, 0.8)");

const adjustAlpha = (rgba: string, alpha: number) => {
	const match = rgba.match(/rgba?\(([^)]+)\)/);
	if (!match) {
		return rgba;
	}

	const components = match[1].split(',').map((part) => part.trim());
	if (components.length < 3) {
		return rgba;
	}

	const [r, g, b] = components;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const toRgba = (color: string | undefined, alpha: number, fallback?: string) => {
	const fallbackColor = fallback ? adjustAlpha(fallback, alpha) : adjustAlpha(baseOrbitColor.value, alpha);
	if (!color) {
		return fallbackColor;
	}

	const trimmed = color.trim();
	if (trimmed.startsWith("var(")) {
		return fallbackColor;
	}

	if (trimmed.startsWith("rgba")) {
		const parts = trimmed.replace(/rgba?\(|\)/g, "").split(',').map((part) => part.trim());
		if (parts.length >= 3) {
			const [r, g, b] = parts;
			return `rgba(${r}, ${g}, ${b}, ${alpha})`;
		}
	}

	if (trimmed.startsWith("rgb")) {
		const parts = trimmed.replace(/rgb\(|\)/g, "").split(',').map((part) => part.trim());
		if (parts.length >= 3) {
			const [r, g, b] = parts;
			return `rgba(${r}, ${g}, ${b}, ${alpha})`;
		}
	}

	if (trimmed.startsWith('#')) {
		const hex = trimmed.slice(1);
		const normalized = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
		const bigint = Number.parseInt(normalized, 16);
		if (!Number.isNaN(bigint)) {
			const r = (bigint >> 16) & 255;
			const g = (bigint >> 8) & 255;
			const b = bigint & 255;
			return `rgba(${r}, ${g}, ${b}, ${alpha})`;
		}
	}

	return fallbackColor;
};

const parseColor = (color?: string): { r: number, g: number, b: number } | null => {
	if (!color) return null;
	const trimmed = color.trim();
	if (trimmed.startsWith("var(")) {
		return null;
	}
	if (trimmed.startsWith("#")) {
		const hex = trimmed.slice(1);
		const normalized = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
		const value = Number.parseInt(normalized, 16);
		if (Number.isNaN(value)) return null;
		return {
			r: (value >> 16) & 255,
			g: (value >> 8) & 255,
			b: value & 255
		};
	}
	const rgbaMatch = trimmed.match(/rgba?\(([^)]+)\)/);
	if (rgbaMatch) {
		const parts = rgbaMatch[1].split(',').map((part) => Number.parseFloat(part.trim()));
		if (parts.length >= 3 && parts.every((num) => Number.isFinite(num))) {
			return { r: parts[0], g: parts[1], b: parts[2] };
		}
	}
	return null;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const rgbToHsl = (r: number, g: number, b: number) => {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return { h: h * 360, s, l };
};

const hslToRgb = (h: number, s: number, l: number) => {
	const hue = h / 360;
	let r: number;
	let g: number;
	let b: number;
	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, hue + 1 / 3);
		g = hue2rgb(p, q, hue);
		b = hue2rgb(p, q, hue - 1 / 3);
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
};

const lighten = (color: { r: number, g: number, b: number }, amount: number) => {
	const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
	const next = hslToRgb(h, s, clamp(l + amount, 0, 1));
	return `rgba(${next.r}, ${next.g}, ${next.b}, 1)`;
};

const darken = (color: { r: number, g: number, b: number }, amount: number) => {
	const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
	const next = hslToRgb(h, s, clamp(l - amount, 0, 1));
	return `rgba(${next.r}, ${next.g}, ${next.b}, 1)`;
};

const basePalette = computed(() => {
	const parsed = parseColor(baseOrbitColor.value);
	if (!parsed) {
		return {
			gradientStart: baseOrbitColor.value,
			gradientEnd: baseOrbitColor.value,
			halo: adjustAlpha(baseOrbitColor.value, 0.28),
			border: adjustAlpha(baseOrbitColor.value, 0.35),
			icon: "rgba(255, 255, 255, 0.92)",
			shadow: adjustAlpha(baseOrbitColor.value, 0.3)
		} as const;
	}
	return {
		gradientStart: lighten(parsed, 0.12),
		gradientEnd: darken(parsed, 0.18),
		halo: adjustAlpha(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, 1)`, 0.26),
		border: adjustAlpha(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, 1)`, 0.38),
		icon: "rgba(255, 255, 255, 0.92)",
		shadow: adjustAlpha(`rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, 1)`, 0.32)
	} as const;
});

const paletteByItem = computed<Record<string, {
	gradientStart: string
	gradientEnd: string
	halo: string
	border: string
	icon: string
	shadow: string
	glare: string
	outerGlow: string
}>>(() => {
	const result: Record<string, {
		gradientStart: string
		gradientEnd: string
		halo: string
		border: string
		icon: string
		shadow: string
		glare: string
		outerGlow: string
	}> = {};

	for (const item of props.items) {
		const parsed = parseColor(item.color);
		const baseColor = parsed
			? `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, 1)`
			: baseOrbitColor.value;
		const gradientStart = item.badgeGradient?.[0]
			|| (parsed ? lighten(parsed, 0.14) : basePalette.value.gradientStart);
		const gradientEnd = item.badgeGradient?.[1]
			|| (parsed ? darken(parsed, 0.2) : basePalette.value.gradientEnd);
		const halo = item.haloColor
			|| adjustAlpha(baseColor, 0.22);
		const border = adjustAlpha(baseColor, 0.36);
		const shadow = adjustAlpha(baseColor, 0.34);
		const icon = item.iconColor || basePalette.value.icon;
		const glare = adjustAlpha(baseColor, 0.45);
		const outerGlow = adjustAlpha(baseColor, 0.28);

		result[item.id] = {
			gradientStart,
			gradientEnd,
			halo,
			border,
			icon,
			shadow,
			glare,
			outerGlow
		};
	}
	return result;
});

const getRingStyle = (radius: number, index: number) => ({
	width: `${radius * 2}px`,
	height: `${radius * 2}px`,
	marginLeft: `-${radius}px`,
	marginTop: `-${radius}px`,
	animationDuration: "46s",
	"--ring-index": index
});

const getOrbitAngle = (index: number, total: number) => {
	if (total === 0) {
		return 0;
	}
	return (index / total) * 2 * Math.PI;
};

const getItemStyle = (index: number, total: number, radius: number) => {
	const angle = getOrbitAngle(index, total);
	const x = Math.cos(angle) * radius;
	const y = Math.sin(angle) * radius;

	return {
		transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
	};
};

const getHaloStyle = (item: OrbitItem) => {
	const palette = paletteByItem.value[item.id] || basePalette.value;
	return {
		background: `
			radial-gradient(circle at 45% 40%, ${palette.halo}, transparent 70%),
			radial-gradient(circle at 60% 65%, ${palette.outerGlow}, transparent 72%)
		`,
		boxShadow: `
			0 0 24px ${palette.outerGlow},
			0 0 36px ${palette.outerGlow}
		`
	};
};

const getBadgeStyle = (item: OrbitItem) => {
	const palette = paletteByItem.value[item.id] || basePalette.value;
	return {
		borderColor: palette.border,
		boxShadow: `
			0 0 20px ${palette.shadow},
			0 0 28px ${palette.outerGlow}
		`,
		background: `transparent`
	};
};

const getIconStyle = (item: OrbitItem) => {
	const palette = paletteByItem.value[item.id] || basePalette.value;
	return {
		color: palette.icon,
		filter: `drop-shadow(0 0 6px ${palette.shadow}) drop-shadow(0 0 12px ${palette.outerGlow})`,
		textShadow: `0 0 6px ${palette.shadow}, 0 0 12px ${palette.outerGlow}`
	};
};

const getConnectionLineStyle = (item: OrbitItem, radius: number) => ({
	position: "absolute",
	width: `${radius * 2}px`,
	height: `${radius * 2}px`,
	marginLeft: `-${radius}px`,
	marginTop: `-${radius}px`,
	left: "50%",
	top: "50%",
	pointerEvents: "none",
	zIndex: 1
});

const getConnectionLineX = (item: OrbitItem) => {
	// Calculate the x position of the active item (50% is center)
	return "50%";
};

const getConnectionLineY = (item: OrbitItem) => {
	// Calculate the y position of the active item (50% is center)
	return "50%";
};
</script>

<style scoped>
.node-orbit {
	position: relative;
	width: 100%;
	height: 100%;
	min-height: 360px;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: visible;
}

.node-orbit__backdrop {
	position: absolute;
	inset: 0;
	background: transparent;
	filter: blur(30px);
	opacity: 0.85;
	pointer-events: none;
}

.node-orbit__center {
	position: absolute;
	width: 88px;
	height: 88px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.node-orbit__center-icon {
	display: none;
}

.node-orbit__pulse {
	position: absolute;
	border-radius: 999px;
	border: 1px solid rgba(255, 255, 255, 0.35);
	animation: orbit-pulse 5s ease-in-out infinite;
}

.node-orbit__center::after {
	content: "";
	position: absolute;
	width: 110%;
	height: 110%;
	border-radius: 999px;
	background: transparent;
	filter: blur(8px);
	opacity: 0.65;
	pointer-events: none;
}

.node-orbit__pulse--one {
	width: 150px;
	height: 150px;
}

.node-orbit__pulse--two {
	width: 198px;
	height: 198px;
	animation-delay: 1.4s;
}

@keyframes orbit-pulse {
	0% {
		opacity: 0.18;
		transform: scale(0.82);
	}
	45% {
		opacity: 0.55;
		transform: scale(1);
	}
	100% {
		opacity: 0;
		transform: scale(1.17);
	}
}

.node-orbit__ring {
	position: absolute;
	left: 50%;
	top: 50%;
	border-radius: 999px;
	border: 1px solid rgba(148, 163, 184, 0.12);
	pointer-events: none;
	transition: transform 0.3s ease;
	transform-origin: center;
	background: transparent;
	box-shadow:
		0 0 18px rgba(59, 130, 246, 0.1),
		0 0 28px rgba(148, 163, 184, 0.08);
	z-index: 1;
}

.node-orbit--animated .node-orbit__ring {
	animation-name: node-orbit-rotate;
	animation-timing-function: linear;
	animation-iteration-count: infinite;
}

.node-orbit--animated .node-orbit__ring:nth-of-type(even) {
	animation-direction: reverse;
}

@keyframes node-orbit-rotate {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

.node-orbit__ring::after {
	content: "";
	position: absolute;
	inset: -1px;
	border-radius: inherit;
	background: transparent;
	opacity: clamp(0.22 + (0.04 * var(--ring-index)), 0.22, 0.38);
	filter: blur(1.8px);
	box-shadow:
		0 0 18px rgba(59, 130, 246, 0.14),
		0 0 28px rgba(148, 163, 184, 0.12);
}

.node-orbit__halo {
	position: absolute;
	width: 60px;
	height: 60px;
	border-radius: 999px;
	filter: blur(16px);
	opacity: 0.75;
	transition: opacity 0.2s ease;
	mix-blend-mode: screen;
	z-index: 0;
}

.node-orbit__item:hover .node-orbit__halo,
.node-orbit__item--active .node-orbit__halo {
	opacity: 1;
}

.node-orbit__item {
	position: absolute;
	top: 50%;
	left: 50%;
	transform-origin: center;
	background: none;
	border: none;
	padding: 0;
	margin: 0;
	cursor: pointer;
	pointer-events: auto;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
	transition: transform 0.25s ease;
}

.node-orbit__item:focus-visible {
	outline: 2px solid rgba(255, 255, 255, 0.65);
	outline-offset: 6px;
	border-radius: 999px;
}

.node-orbit__badge {
	position: relative;
	width: 40px;
	height: 40px;
	border-radius: 999px;
	border: 2px solid rgba(148, 163, 184, 0.45);
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	backdrop-filter: blur(6px);
	transition:
		transform 0.25s ease,
		border-color 0.25s ease,
		box-shadow 0.25s ease,
		filter 0.25s ease,
		background-color 0.25s ease;
	filter: drop-shadow(0 2px 6px rgba(15, 23, 42, 0.25));
	will-change: transform;
	overflow: hidden;
	z-index: 2;
}

.node-orbit__badge--active {
	background: transparent;
	border-color: rgba(59, 130, 246, 0.8);
	box-shadow:
		0 0 16px rgba(59, 130, 246, 0.4),
		0 0 24px rgba(59, 130, 246, 0.25),
		inset 0 0 12px rgba(255, 255, 255, 0.15);
	filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.35));
}

.node-orbit__badge::after {
	content: "";
	position: absolute;
	inset: 4px;
	border-radius: inherit;
	background: transparent;
	opacity: 0.4;
	pointer-events: none;
	z-index: 0;
	transition: opacity 0.25s ease;
}

.node-orbit__badge--active::after {
	opacity: 0.6;
}

.node-orbit__badge-content {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	position: relative;
	z-index: 1;
}

.node-orbit__badge-icon,
.node-orbit__badge-initial {
	width: 22px;
	height: 22px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: rgba(255, 255, 255, 0.96);
}

.node-orbit__badge-icon {
	filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.45)) drop-shadow(0 0 14px rgba(59, 130, 246, 0.35));
	transition: all 0.25s ease;
}

.node-orbit__badge-icon--active {
	filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.75)) drop-shadow(0 0 20px rgba(59, 130, 246, 0.55));
	text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
}

.node-orbit__badge-initial {
	font-size: 16px;
	font-weight: 600;
	letter-spacing: 0.04em;
	text-shadow:
		0 0 6px rgba(59, 130, 246, 0.45),
		0 0 12px rgba(94, 234, 212, 0.4);
}

.node-orbit__connection-line {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	stroke-linecap: round;
	filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
}
</style>

