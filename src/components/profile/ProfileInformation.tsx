import { User } from "lucide-react";
import { FormInput } from "~/components/FormInput";

interface ProfileInformationProps {
	name: string;
	email: string;
	createdAt?: string;
	onNameChange: (value: string) => void;
	onEmailChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	isUpdating: boolean;
	error?: string;
	success?: string;
}

export function ProfileInformation({
	name,
	email,
	createdAt,
	onNameChange,
	onEmailChange,
	onSubmit,
	isUpdating,
	error,
	success,
}: ProfileInformationProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
			<div className="flex items-center gap-2 mb-6">
				<User className="w-5 h-5 text-romance-500" />
				<h2 className="text-2xl font-bold text-slate-900">
					Profile Information
				</h2>
			</div>

			<form onSubmit={onSubmit} className="space-y-4">
				<FormInput
					label="Name"
					type="text"
					value={name}
					onChange={(e) => onNameChange(e.target.value)}
					required
				/>
				<FormInput
					label="Email"
					type="email"
					value={email}
					onChange={(e) => onEmailChange(e.target.value)}
					required
				/>
				{createdAt && (
					<div className="text-sm text-slate-600">
						Account created: {new Date(createdAt).toLocaleDateString()}
					</div>
				)}

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
					{isUpdating ? "Updating..." : "Update Profile"}
				</button>
			</form>
		</div>
	);
}
