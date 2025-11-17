/**
 * Cookie Consent Banner
 *
 * Non-intrusive footer banner that informs users about cookie usage
 * and obtains consent for account creation.
 */

import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCookieConsent } from "~/hooks/useCookieConsent";

export function CookieConsentBanner() {
	const { shouldShowBanner, giveConsent } = useCookieConsent();
	const [isVisible, setIsVisible] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	// Handle animations
	useEffect(() => {
		if (shouldShowBanner) {
			// Delay showing to allow page to settle
			const timer = setTimeout(() => {
				setIsVisible(true);
				// Start slide-up animation
				requestAnimationFrame(() => {
					setIsAnimating(true);
				});
			}, 500);

			return () => clearTimeout(timer);
		}
		setIsAnimating(false);
		setIsVisible(false);
	}, [shouldShowBanner]);

	const handleAccept = () => {
		setIsAnimating(false);
		// Wait for slide-down animation before hiding
		setTimeout(() => {
			giveConsent();
			setIsVisible(false);
		}, 300);
	};

	const handleClose = () => {
		setIsAnimating(false);
		setTimeout(() => {
			setIsVisible(false);
		}, 300);
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 z-40 transform transition-transform duration-300 ease-out ${
				isAnimating ? "translate-y-0" : "translate-y-full"
			}`}
			role="dialog"
			aria-labelledby="cookie-banner-title"
			aria-describedby="cookie-banner-description"
		>
			<div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
				<div className="container mx-auto px-4 py-4">
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
						{/* Icon */}
						<div className="shrink-0">
							<Cookie
								className="w-6 h-6 text-romance-600 dark:text-romance-400"
								aria-hidden="true"
							/>
						</div>

						{/* Content */}
						<div className="flex-1 space-y-2">
							<h2
								id="cookie-banner-title"
								className="text-lg font-semibold text-slate-900 dark:text-white"
							>
								Cookie Notice
							</h2>
							<p
								id="cookie-banner-description"
								className="text-sm text-slate-700 dark:text-slate-300"
							>
								We only use essential cookies to keep you logged in and secure
								your account. By creating an account, you accept our use of
								these cookies.{" "}
								<a
									href="/cookies"
									className="text-romance-600 dark:text-romance-400 hover:text-romance-700 dark:hover:text-romance-300 underline font-medium"
								>
									Learn more
								</a>
							</p>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
							<Link
								to="/privacy"
								className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
							>
								Privacy Policy
							</Link>

							<button
								type="button"
								onClick={handleAccept}
								className="px-6 py-2 bg-romance-600 hover:bg-romance-700 dark:bg-romance-500 dark:hover:bg-romance-600 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-romance-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
								aria-label="Accept cookie policy"
							>
								Accept
							</button>

							<button
								type="button"
								onClick={handleClose}
								className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-romance-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 rounded"
								aria-label="Close banner"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
