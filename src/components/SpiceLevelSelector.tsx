import { Flame } from "lucide-react";
import { SPICE_LABELS, type SpiceLevel } from "~/lib/types/preferences";

interface SpiceLevelSelectorProps {
	value: SpiceLevel | null;
	onChange: (level: SpiceLevel) => void;
	showDescription?: boolean;
}

/**
 * Reusable spice level selector component
 * Displays 1-5 flame icons for selecting content heat level
 */
export function SpiceLevelSelector({
	value,
	onChange,
	showDescription = true,
}: SpiceLevelSelectorProps) {
	return (
		<div>
			<label className="block text-sm font-semibold text-slate-700 mb-3">
				Spice Level
			</label>
			<div className="grid grid-cols-5 gap-2">
				{([1, 2, 3, 4, 5] as SpiceLevel[]).map((level) => (
					<button
						key={level}
						type="button"
						onClick={() => onChange(level)}
						className={`p-3 rounded-lg border-2 transition-all ${
							value === level
								? "border-romance-600 bg-romance-50"
								: "border-slate-200 bg-white hover:border-slate-300"
						}`}
					>
						<div className="flex flex-col items-center gap-1">
							<div className="flex gap-0.5">
								{Array.from({ length: level }).map((_, i) => (
									<Flame
										key={i}
										className="w-4 h-4 text-romance-500 fill-romance-500"
									/>
								))}
							</div>
							<span className="text-xs font-medium text-slate-700">
								{SPICE_LABELS[level].label}
							</span>
						</div>
					</button>
				))}
			</div>
			{showDescription && value && (
				<p className="text-xs text-slate-500 mt-2">
					{SPICE_LABELS[value].description}
				</p>
			)}
		</div>
	);
}
