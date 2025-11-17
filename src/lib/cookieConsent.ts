/**
 * Cookie Consent Management
 *
 * Handles GDPR-compliant cookie consent storage and retrieval.
 * Stores user's consent preferences in localStorage.
 */

const CONSENT_STORAGE_KEY = "cookie_consent";
const CONSENT_VERSION = "1.0";

export interface CookieConsent {
	/** Whether user has given consent */
	consentGiven: boolean;
	/** ISO 8601 timestamp of when consent was given */
	consentDate: string;
	/** Version of the cookie policy consented to */
	version: string;
	/** Whether user has acknowledged the banner (even if not consented) */
	acknowledged: boolean;
}

/**
 * Get the current cookie consent from localStorage
 * Returns null if not set or if localStorage is unavailable
 */
export function getCookieConsent(): CookieConsent | null {
	if (typeof window === "undefined" || !window.localStorage) {
		return null;
	}

	try {
		const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
		if (!stored) {
			return null;
		}

		const consent = JSON.parse(stored) as CookieConsent;
		return consent;
	} catch (error) {
		console.error("Error reading cookie consent:", error);
		return null;
	}
}

/**
 * Store cookie consent in localStorage
 */
export function setCookieConsent(consent: CookieConsent): void {
	if (typeof window === "undefined" || !window.localStorage) {
		console.warn("localStorage not available, cannot store consent");
		return;
	}

	try {
		localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
	} catch (error) {
		console.error("Error storing cookie consent:", error);
	}
}

/**
 * Check if user has given valid consent
 * Returns false if no consent, consent is for old version, or localStorage unavailable
 */
export function hasConsent(): boolean {
	const consent = getCookieConsent();
	if (!consent) {
		return false;
	}

	// Check if consent is for current version
	if (consent.version !== CONSENT_VERSION) {
		return false;
	}

	return consent.consentGiven;
}

/**
 * Check if user has acknowledged the banner (even without full consent)
 */
export function hasAcknowledged(): boolean {
	const consent = getCookieConsent();
	return consent?.acknowledged ?? false;
}

/**
 * Give consent and store it
 */
export function giveConsent(): void {
	const consent: CookieConsent = {
		consentGiven: true,
		consentDate: new Date().toISOString(),
		version: CONSENT_VERSION,
		acknowledged: true,
	};
	setCookieConsent(consent);

	// Dispatch custom event so other components can react
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("cookieConsentChanged"));
	}
}

/**
 * Acknowledge the banner without giving full consent
 * (Used for temporary dismissal)
 */
export function acknowledgeBanner(): void {
	const existing = getCookieConsent();
	const consent: CookieConsent = {
		consentGiven: existing?.consentGiven ?? false,
		consentDate: existing?.consentDate ?? new Date().toISOString(),
		version: CONSENT_VERSION,
		acknowledged: true,
	};
	setCookieConsent(consent);
}

/**
 * Clear all consent data (for testing or user request)
 */
export function clearConsent(): void {
	if (typeof window === "undefined" || !window.localStorage) {
		return;
	}

	try {
		localStorage.removeItem(CONSENT_STORAGE_KEY);

		// Dispatch custom event
		if (typeof window !== "undefined") {
			window.dispatchEvent(new CustomEvent("cookieConsentChanged"));
		}
	} catch (error) {
		console.error("Error clearing cookie consent:", error);
	}
}

/**
 * Get the current consent version
 */
export function getConsentVersion(): string {
	return CONSENT_VERSION;
}

/**
 * Check if consent needs renewal due to policy update
 */
export function needsConsentRenewal(): boolean {
	const consent = getCookieConsent();
	if (!consent) {
		return true;
	}

	return consent.version !== CONSENT_VERSION;
}
