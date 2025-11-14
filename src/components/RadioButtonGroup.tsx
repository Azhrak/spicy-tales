interface RadioOption<T extends string> {
	value: T;
	label: string;
	description: string;
}

interface RadioButtonGroupProps<T extends string> {
	label: string;
	value: T | null;
	options: RadioOption<T>[];
	onChange: (value: T) => void;
	columns?: 1 | 2 | 3;
}

/**
 * Generic radio button group component
 * Used for pacing, scene length, and other preference selections
 */
export function RadioButtonGroup<T extends string>({
	label,
	value,
	options,
	onChange,
	columns = 2,
}: RadioButtonGroupProps<T>) {
	const gridClass = {
		1: "grid-cols-1",
		2: "grid-cols-2",
		3: "grid-cols-3",
	}[columns];

	return (
		<div>
			<div className="block text-sm font-semibold text-slate-700 mb-3">
				{label}
			</div>
			<div className={`grid ${gridClass} gap-3`}>
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => onChange(option.value)}
						className={`p-4 rounded-lg border-2 transition-all text-left ${
							value === option.value
								? "border-romance-600 bg-romance-50"
								: "border-slate-200 bg-white hover:border-slate-300"
						}`}
					>
						<div className="font-semibold text-slate-900 mb-1">
							{option.label}
						</div>
						<div className="text-sm text-slate-600">{option.description}</div>
					</button>
				))}
			</div>
		</div>
	);
}
