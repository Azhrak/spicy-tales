import { User } from "lucide-react";
import { Button } from "~/components/Button";
import { FormInput } from "~/components/FormInput";
import { Card } from "~/components/ui";

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
		<Card>
			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<User className="w-5 h-5 text-romance-500" />
					<h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
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
						<div className="text-sm text-slate-600 dark:text-gray-400">
							Account created: {new Date(createdAt).toLocaleDateString()}
						</div>
					)}

					{error && (
						<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
							{error}
						</div>
					)}

					{success && (
						<div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
							{success}
						</div>
					)}

					<Button type="submit" loading={isUpdating} variant="primary">
						Update Profile
					</Button>
				</form>
			</div>
		</Card>
	);
}
