import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: {
		label: string;
		href: string;
	};
	className?: string;
	children?: ReactNode;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className = "",
	children,
}: EmptyStateProps) {
	return (
		<div
			className={`bg-white rounded-2xl shadow-lg p-12 text-center space-y-4 ${className}`}
		>
			<Icon className="w-16 h-16 text-slate-300 mx-auto" />
			<h2 className="text-2xl font-bold text-slate-900">{title}</h2>
			<div className="space-y-6">
				<p className="text-slate-600">{description}</p>
				{action && (
					<Link
						to={action.href}
						className="inline-flex items-center px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors"
					>
						{action.label}
					</Link>
				)}
				{children}
			</div>
		</div>
	);
}
