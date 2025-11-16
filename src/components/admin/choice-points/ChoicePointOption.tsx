import { X } from "lucide-react";
import { FormInput } from "~/components/FormInput";

export interface ChoiceOption {
	id: string;
	text: string;
	tone: string;
	impact: string;
}

interface ChoicePointOptionProps {
	option: ChoiceOption;
	optionIndex: number;
	choicePointIndex: number;
	canRemove: boolean;
	onUpdate: (updates: Partial<ChoiceOption>) => void;
	onRemove: () => void;
}

export function ChoicePointOption({
	option,
	optionIndex,
	choicePointIndex,
	canRemove,
	onUpdate,
	onRemove,
}: ChoicePointOptionProps) {
	return (
		<div className="bg-white border border-slate-200 rounded-lg p-4">
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-slate-700">
						Option {optionIndex + 1}
					</span>
					{canRemove && (
						<button
							type="button"
							onClick={onRemove}
							className="text-red-600 hover:text-red-700"
							aria-label="Remove option"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>

				<div className="space-y-3">
					<FormInput
						label="Text *"
						type="text"
						id={`option-text-${choicePointIndex}-${optionIndex}`}
						value={option.text}
						onChange={(e) => onUpdate({ text: e.target.value })}
						className="px-3 py-2 text-sm"
						labelClassName="text-xs"
						placeholder="e.g., Challenge them with skepticism"
						required
					/>

					<div className="grid grid-cols-2 gap-3">
						<FormInput
							label="Tone *"
							type="text"
							id={`option-tone-${choicePointIndex}-${optionIndex}`}
							value={option.tone}
							onChange={(e) => onUpdate({ tone: e.target.value })}
							className="px-3 py-2 text-sm"
							labelClassName="text-xs"
							placeholder="e.g., confrontational"
							required
						/>
						<FormInput
							label="Impact *"
							type="text"
							id={`option-impact-${choicePointIndex}-${optionIndex}`}
							value={option.impact}
							onChange={(e) => onUpdate({ impact: e.target.value })}
							className="px-3 py-2 text-sm"
							labelClassName="text-xs"
							placeholder="e.g., bold"
							required
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
