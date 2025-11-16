import { Plus } from "lucide-react";
import { Button } from "~/components/Button";
import {
	type ChoiceOption,
	type ChoicePoint,
	ChoicePointItem,
} from "./choice-points";

interface ChoicePointFormProps {
	choicePoints: ChoicePoint[];
	onChange: (choicePoints: ChoicePoint[]) => void;
	maxScenes: number;
}

export type { ChoiceOption, ChoicePoint };

export function ChoicePointForm({
	choicePoints,
	onChange,
	maxScenes,
}: ChoicePointFormProps) {
	const maxChoicePoints = maxScenes - 1;

	const addChoicePoint = () => {
		if (choicePoints.length >= maxChoicePoints) {
			return;
		}

		// Find the next available scene number (must be after the last choice point)
		let nextSceneNumber = 1;
		if (choicePoints.length > 0) {
			// Start from after the last choice point's scene number
			const lastSceneNumber =
				choicePoints[choicePoints.length - 1].scene_number;
			nextSceneNumber = lastSceneNumber + 1;
		}

		// Ensure we don't exceed maxScenes
		if (nextSceneNumber > maxScenes) {
			nextSceneNumber = maxScenes;
		}

		const newChoicePoint: ChoicePoint = {
			scene_number: nextSceneNumber,
			prompt_text: "",
			options: [
				{ id: "option-1", text: "", tone: "", impact: "" },
				{ id: "option-2", text: "", tone: "", impact: "" },
			],
		};

		onChange([...choicePoints, newChoicePoint]);
	};

	const removeChoicePoint = (index: number) => {
		onChange(choicePoints.filter((_, i) => i !== index));
	};

	const updateChoicePoint = (index: number, updates: Partial<ChoicePoint>) => {
		const updated = [...choicePoints];
		updated[index] = { ...updated[index], ...updates };
		onChange(updated);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-slate-900">Choice Points</h3>
				<p className="text-sm text-slate-600 mt-1">
					Add choice points in chronological order. Maximum {maxChoicePoints}{" "}
					choice points (one after each scene, except the last).
				</p>
			</div>

			{choicePoints.length === 0 ? (
				<div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
					<p className="text-slate-600">No choice points added yet.</p>
					<p className="text-sm text-slate-500 mt-1">
						Click "Add Choice Point" to create your first choice point.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{choicePoints.map((choicePoint, cpIndex) => (
						<ChoicePointItem
							key={`choice-point-${choicePoint.scene_number}-${cpIndex}`}
							choicePoint={choicePoint}
							choicePointIndex={cpIndex}
							maxScenes={maxScenes}
							allChoicePoints={choicePoints}
							onUpdate={(updates) => updateChoicePoint(cpIndex, updates)}
							onRemove={() => removeChoicePoint(cpIndex)}
						/>
					))}
				</div>
			)}

			<Button
				type="button"
				onClick={addChoicePoint}
				variant="secondary"
				disabled={choicePoints.length >= maxChoicePoints}
				className="w-full"
			>
				<Plus className="w-4 h-4" />
				Add Choice Point
			</Button>
		</div>
	);
}
