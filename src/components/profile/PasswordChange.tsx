import { Lock } from "lucide-react";
import { FormInput } from "~/components/FormInput";

interface PasswordChangeProps {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
	onCurrentPasswordChange: (value: string) => void;
	onNewPasswordChange: (value: string) => void;
	onConfirmPasswordChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	isUpdating: boolean;
	error?: string;
	success?: string;
}

export function PasswordChange({
	currentPassword,
	newPassword,
	confirmPassword,
	onCurrentPasswordChange,
	onNewPasswordChange,
	onConfirmPasswordChange,
	onSubmit,
	isUpdating,
	error,
	success,
}: PasswordChangeProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
			<div className="flex items-center gap-2 mb-6">
				<Lock className="w-5 h-5 text-romance-500" />
				<h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
			</div>

			<form onSubmit={onSubmit} className="space-y-4">
				<FormInput
					label="Current Password"
					type="password"
					value={currentPassword}
					onChange={(e) => onCurrentPasswordChange(e.target.value)}
					required
				/>
				<FormInput
					label="New Password"
					type="password"
					value={newPassword}
					onChange={(e) => onNewPasswordChange(e.target.value)}
					required
					helperText="At least 8 characters with uppercase, lowercase, and numbers"
				/>
				<FormInput
					label="Confirm New Password"
					type="password"
					value={confirmPassword}
					onChange={(e) => onConfirmPasswordChange(e.target.value)}
					required
				/>
				{error && (
					<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				)}

				{success && (
					<div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
						{success}
					</div>
				)}

				<button
					type="submit"
					disabled={isUpdating}
					className="px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isUpdating ? "Changing..." : "Change Password"}
				</button>
			</form>
		</div>
	);
}
