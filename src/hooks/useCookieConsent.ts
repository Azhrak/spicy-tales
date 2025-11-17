/**
 * React Hook for Cookie Consent Management
 *
 * Provides reactive state management for cookie consent.
 * Syncs with localStorage and notifies components of changes.
 */

import { useEffect, useState } from "react";
import {
	acknowledgeBanner,
	type CookieConsent,
	getCookieConsent,
	giveConsent as giveConsentUtil,
	hasConsent as hasConsentUtil,
} from "~/lib/cookieConsent";

interface UseCookieConsentReturn {
	/** Whether user has given valid consent */
	hasConsent: boolean;
	/** Full consent object (null if not set) */
	consent: CookieConsent | null;
	/** Function to give consent */
	giveConsent: () => void;
	/** Function to acknowledge banner without full consent */
	acknowledge: () => void;
	/** Whether the hook is still loading initial state */
	isLoading: boolean;
	/** Whether banner should be shown */
	shouldShowBanner: boolean;
}

/**
 * Hook to manage cookie consent state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasConsent, giveConsent, shouldShowBanner } = useCookieConsent();
 *
 *   if (shouldShowBanner) {
 *     return <CookieConsentBanner onAccept={giveConsent} />;
 *   }
 *
 *   return <div>Content</div>;
 * }
 * ```
 */
export function useCookieConsent(): UseCookieConsentReturn {
	const [consent, setConsent] = useState<CookieConsent | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load initial consent state
	useEffect(() => {
		const loadConsent = () => {
			const currentConsent = getCookieConsent();
			setConsent(currentConsent);
			setIsLoading(false);
		};

		loadConsent();
	}, []);

	// Listen for consent changes from other tabs/windows
	useEffect(() => {
		const handleConsentChange = () => {
			const currentConsent = getCookieConsent();
			setConsent(currentConsent);
		};

		// Listen for storage changes (other tabs)
		window.addEventListener("storage", handleConsentChange);

		// Listen for custom consent change events (same tab)
		window.addEventListener("cookieConsentChanged", handleConsentChange);

		return () => {
			window.removeEventListener("storage", handleConsentChange);
			window.removeEventListener("cookieConsentChanged", handleConsentChange);
		};
	}, []);

	const giveConsent = () => {
		giveConsentUtil();
		setConsent(getCookieConsent());
	};

	const acknowledge = () => {
		acknowledgeBanner();
		setConsent(getCookieConsent());
	};

	const hasConsent = hasConsentUtil();

	// Show banner if user hasn't acknowledged and we're not loading
	const shouldShowBanner = !isLoading && !consent?.acknowledged;

	return {
		hasConsent,
		consent,
		giveConsent,
		acknowledge,
		isLoading,
		shouldShowBanner,
	};
}
