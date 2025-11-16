import { Heart } from "lucide-react";
import { Heading } from "~/components/Heading";
import { Card } from "~/components/ui";
import { TROPE_LABELS, TROPES, type Trope } from "~/lib/types/preferences";

interface TropesSectionProps {
	selectedTropes: Trope[];
	onToggle: (trope: Trope) => void;
}

export function TropesSection({
	selectedTropes,
	onToggle,
}: TropesSectionProps) {
	return (
		<Card padding="md">
			<div className="space-y-6">
				<div className="flex items-center">
					<Heart className="w-6 h-6 text-romance-500 mr-2" />
					<Heading level="h3" size="section">
						Tropes
					</Heading>
				</div>
				<p className="text-slate-600 dark:text-gray-300">
					Choose your favorite romance tropes
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{TROPES.map((trope) => (
						<button
							key={trope}
							type="button"
							onClick={() => onToggle(trope)}
							className={`p-4 rounded-lg border-2 transition-all text-left ${
								selectedTropes.includes(trope)
									? "border-romance-500 bg-romance-50 dark:bg-romance-500/20 text-romance-700 dark:text-pink-200"
									: "border-slate-200 dark:border-gray-600 hover:border-romance-300 dark:hover:border-romance-500 text-slate-700 dark:text-gray-200"
							}`}
						>
							<div className="font-semibold">{TROPE_LABELS[trope]}</div>
						</button>
					))}
				</div>
			</div>
		</Card>
	);
}
