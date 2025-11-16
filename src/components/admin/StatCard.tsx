import type { LucideIcon } from "lucide-react";

interface StatCardProps {
	title: string;
	value: number | string;
	icon: LucideIcon;
	color: string;
}

/**
 * Reusable stat card component for admin dashboards
 * Displays a metric with an icon in a colored background
 */
export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div
						className={`p-3 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}
					>
						<Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
					</div>
				</div>
				<div className="space-y-1">
					<h3 className="text-sm font-medium text-slate-600 dark:text-gray-400">
						{title}
					</h3>
					<p className="text-3xl font-bold text-slate-900 dark:text-gray-100">
						{value}
					</p>
				</div>
			</div>
		</div>
	);
}
