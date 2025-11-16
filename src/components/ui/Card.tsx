import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface CardProps {
	children: ReactNode;
	className?: string;
	padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Reusable card container component
 * Provides consistent styling for white card containers with rounded corners and shadow
 */
export function Card({ children, className, padding = "lg" }: CardProps) {
	const paddingClasses = {
		none: "",
		sm: "p-4",
		md: "p-6",
		lg: "p-8",
	};

	return (
		<div
			className={cn(
				"bg-white dark:bg-gray-800 rounded-2xl shadow-lg",
				paddingClasses[padding],
				className,
			)}
		>
			{children}
		</div>
	);
}
