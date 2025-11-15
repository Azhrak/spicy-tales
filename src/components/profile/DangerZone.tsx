import { AlertTriangle } from "lucide-react";
import { Button } from "~/components/Button";

interface DangerZoneProps {
	onDeleteClick: () => void;
}

export function DangerZone({ onDeleteClick }: DangerZoneProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<AlertTriangle className="w-5 h-5 text-red-500" />
					<h2 className="text-2xl font-bold text-red-900">Danger Zone</h2>
				</div>

				<p className="text-slate-600">
					Once you delete your account, there is no going back. All your stories
					and preferences will be permanently deleted.
				</p>

				<Button
					type="button"
					onClick={onDeleteClick}
					variant="danger"
					className="px-6 py-3"
				>
					Delete Account
				</Button>
			</div>
		</div>
	);
}
