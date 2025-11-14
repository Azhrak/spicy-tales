export interface GradientOption {
	value: string;
	label: string;
}

/**
 * Available gradient options for template covers
 * These Tailwind classes are used for the background gradients
 */
export const GRADIENT_OPTIONS: GradientOption[] = [
	{ value: "from-purple-600 to-pink-600", label: "Purple to Pink" },
	{ value: "from-blue-600 to-cyan-600", label: "Blue to Cyan" },
	{ value: "from-green-600 to-teal-600", label: "Green to Teal" },
	{ value: "from-red-600 to-orange-600", label: "Red to Orange" },
	{ value: "from-indigo-600 to-purple-600", label: "Indigo to Purple" },
	{ value: "from-pink-600 to-rose-600", label: "Pink to Rose" },
	{ value: "from-amber-600 to-yellow-600", label: "Amber to Yellow" },
	{ value: "from-slate-600 to-slate-800", label: "Slate Dark" },
];
