export interface GradientOption {
	value: string;
	label: string;
}

/**
 * Available gradient options for template covers
 * These Tailwind classes are used for the background gradients
 */
export const GRADIENT_OPTIONS: GradientOption[] = [
	{ value: "from-amber-400 to-orange-500", label: "Amber to Orange" },
	{ value: "from-amber-500 to-yellow-600", label: "Amber to Yellow" },
	{ value: "from-amber-600 to-yellow-600", label: "Amber to Yellow (Alt)" },
	{ value: "from-blue-600 to-cyan-600", label: "Blue to Cyan" },
	{ value: "from-blue-600 to-indigo-800", label: "Blue to Indigo" },
	{ value: "from-cyan-400 to-blue-500", label: "Cyan to Blue" },
	{ value: "from-emerald-600 to-teal-700", label: "Emerald to Teal" },
	{ value: "from-fuchsia-500 to-pink-600", label: "Fuchsia to Pink" },
	{ value: "from-gray-400 to-slate-700", label: "Gray to Slate (Light)" },
	{ value: "from-gray-700 to-slate-900", label: "Gray to Slate" },
	{ value: "from-green-500 to-emerald-700", label: "Green to Emerald" },
	{ value: "from-green-600 to-teal-600", label: "Green to Teal" },
	{ value: "from-indigo-600 to-purple-600", label: "Indigo to Purple" },
	{ value: "from-lime-500 to-green-600", label: "Lime to Green" },
	{ value: "from-orange-600 to-red-700", label: "Orange to Red" },
	{ value: "from-pink-600 to-rose-600", label: "Pink to Rose" },
	{ value: "from-purple-500 to-pink-600", label: "Purple to Pink" },
	{ value: "from-purple-600 to-indigo-700", label: "Purple to Indigo" },
	{ value: "from-purple-600 to-pink-600", label: "Purple to Pink (Alt)" },
	{ value: "from-red-600 to-orange-600", label: "Red to Orange" },
	{ value: "from-red-600 to-rose-700", label: "Red to Rose" },
	{ value: "from-red-700 to-black", label: "Red to Black" },
	{ value: "from-rose-400 to-red-500", label: "Rose to Red" },
	{ value: "from-rose-500 to-pink-600", label: "Rose to Pink" },
	{ value: "from-sky-500 to-blue-600", label: "Sky to Blue" },
	{ value: "from-slate-600 to-gray-800", label: "Slate to Gray" },
	{ value: "from-slate-600 to-slate-800", label: "Slate Dark" },
	{ value: "from-stone-600 to-zinc-800", label: "Stone to Zinc" },
	{ value: "from-teal-500 to-cyan-700", label: "Teal to Cyan" },
	{ value: "from-violet-600 to-purple-800", label: "Violet to Purple" },
	{ value: "from-yellow-600 to-amber-700", label: "Yellow to Amber" },
	{ value: "from-yellow-600 to-orange-700", label: "Yellow to Orange" },
	{ value: "from-zinc-700 to-neutral-900", label: "Zinc to Neutral" },
];
