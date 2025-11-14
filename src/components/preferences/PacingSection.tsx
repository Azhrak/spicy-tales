import {
	PACING_LABELS,
	PACING_OPTIONS,
	type PacingOption,
} from "~/lib/types/preferences";

interface PacingSectionProps {
	selectedPacing: PacingOption;
	onSelect: (pacing: PacingOption) => void;
}

export function PacingSection({ selectedPacing, onSelect }: PacingSectionProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<h3 className="text-xl font-bold text-slate-900 mb-4">
				Relationship Pacing
			</h3>
			<p className="text-slate-600 mb-6">
				How quickly should relationships develop in your stories?
			</p>
			<div className="space-y-3">
				{PACING_OPTIONS.map((pacing) => (
					<button
						key={pacing}
						type="button"
						onClick={() => onSelect(pacing)}
						className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
							selectedPacing === pacing
								? "border-romance-500 bg-romance-50"
								: "border-slate-200 hover:border-romance-300"
						}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-slate-900">
									{PACING_LABELS[pacing].label}
								</div>
								<p className="text-sm text-slate-600">
									{PACING_LABELS[pacing].description}
								</p>
							</div>
							<div
								className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
									selectedPacing === pacing
										? "border-romance-500 bg-romance-500"
										: "border-slate-300"
								}`}
							>
								{selectedPacing === pacing && (
									<div className="w-2 h-2 bg-white rounded-full" />
								)}
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
