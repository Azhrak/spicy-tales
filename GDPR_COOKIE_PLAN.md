# GDPR Cookie Consent Implementation Plan

**Created:** November 17, 2025  
**Status:** In Progress

## Overview

Implement GDPR-compliant cookie consent system for Choose the Heat. The implementation focuses on transparency and user control while maintaining a non-intrusive user experience.

## Current Cookie Inventory

### Strictly Necessary Cookies

1. **`session_id`**
   - **Purpose:** Maintains user authentication session
   - **Duration:** 30 days
   - **Attributes:** HttpOnly, Secure, SameSite=Lax
   - **Set by:** Server-side authentication system
   - **Required for:** User login, account features, personalization
   - **Can be disabled:** No (site authentication won't work)

2. **`oauth_state`**
   - **Purpose:** CSRF protection during Google OAuth flow
   - **Duration:** 10 minutes (600 seconds)
   - **Attributes:** HttpOnly, SameSite=Lax
   - **Set by:** OAuth authentication flow
   - **Required for:** Secure Google Sign-In
   - **Can be disabled:** No (OAuth flow will fail)

### Optional/Analytics Cookies

**Current:** None  
**Future considerations:** Analytics, A/B testing, preferences (would require separate opt-in)

## GDPR Compliance Requirements

### Legal Requirements

- ✅ **Transparency:** Clearly inform users about all cookies
- ✅ **Consent:** Obtain consent before non-essential cookies (we have none currently)
- ✅ **Documentation:** Maintain cookie policy and privacy policy
- ✅ **Control:** Allow users to manage preferences
- ✅ **Information:** Explain purpose, duration, and type of each cookie
- ⚠️ **Strictly Necessary Exception:** Can use authentication cookies without explicit consent, but must inform users

### Best Practices

- Inform users even about strictly necessary cookies
- Make cookie policy easily accessible
- Require acknowledgment before account creation
- Store consent preferences
- Allow easy access to cookie information
- Track consent version for policy updates

## UX Design: Non-Intrusive Footer Banner

### Design Principles

1. **Non-blocking:** Don't prevent browsing/reading
2. **Informative:** Clear explanation of cookie use
3. **Accessible:** Links to detailed policies
4. **Compliant:** Block account creation until acknowledged
5. **Subtle:** Fixed footer, minimal visual impact
6. **Persistent:** Reappears until dismissed

### Banner Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🍪 Cookie Notice                                                        │
│  We only use essential cookies to keep you logged in and secure your    │
│  account. By creating an account, you accept our use of these cookies.  │
│  [Cookie Policy] [Privacy Policy]                           [Accept]    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Visual Specifications:**

- Position: Fixed bottom, full width
- Background: White with subtle shadow
- Animation: Slide up from bottom (300ms ease-out)
- Z-index: High but below modals
- Padding: Comfortable spacing
- Typography: Body text size, readable
- Buttons: Primary style for "Accept", links for policies

### User Flows

#### Anonymous Visitor

1. Arrives on site → Banner slides up from bottom
2. Can browse, read public stories, view features
3. Clicks "Accept" → Consent stored, banner dismissed
4. OR tries to signup/login → Prompted to accept first

#### Attempting Account Creation Without Consent

1. Clicks "Sign Up" → Modal/form opens
2. Sees message: "Please accept our cookie policy to create an account"
3. Clicks accept in banner or in modal
4. Consent stored → Proceeds with signup

#### Returning User (Consented)

1. Arrives on site → No banner shown
2. Full access to all features
3. Can view cookie preferences in account settings

## Technical Implementation

### Architecture

```
src/
  lib/
    cookieConsent.ts              # Core consent logic
  hooks/
    useCookieConsent.ts           # React hook
  components/
    CookieConsentBanner.tsx       # Banner UI
  routes/
    cookies.tsx                   # Cookie policy page
    privacy.tsx                   # Updated privacy policy
    api/
      auth/
        signup.ts                 # Add consent check
        login.ts                  # Add consent check
```

### Consent Storage

**Location:** localStorage (legal for consent preferences)

**Data Structure:**

```typescript
interface CookieConsent {
  consentGiven: boolean;
  consentDate: string; // ISO 8601
  version: string;     // Policy version (e.g., "1.0")
  acknowledged: boolean; // Banner dismissed
}
```

**Key:** `cookie_consent`

### Component Specifications

#### `lib/cookieConsent.ts`

- `getCookieConsent()`: Retrieve current consent
- `setCookieConsent(consent)`: Store consent
- `hasConsent()`: Check if user has consented
- `clearConsent()`: Remove consent (for testing)
- `CONSENT_VERSION`: Current policy version constant

#### `hooks/useCookieConsent.ts`

- Returns `{ hasConsent, giveConsent, consent, isLoading }`
- Handles localStorage access safely
- Provides methods to update consent
- Reactive state management

#### `components/CookieConsentBanner.tsx`

- Fixed position footer banner
- Show/hide based on consent state
- Accept button triggers consent storage
- Links to cookie policy and privacy policy
- Accessible keyboard navigation
- Respects reduced motion preferences
- Auto-hide after consent

### Enforcement Points

1. **Signup Form:** Check consent before allowing submission
2. **Login Form:** Check consent before allowing submission
3. **OAuth Callback:** Verify consent exists before creating session
4. **Account Settings:** Display current consent status

### Cookie Policy Page (`/cookies`)

**Sections:**

1. **Introduction**
   - What cookies are
   - Why we use them
   - Your rights under GDPR

2. **Cookie List Table**

   | Cookie Name | Purpose | Duration | Category | Can Disable? |
   |-------------|---------|----------|----------|--------------|
   | session_id | Authentication | 30 days | Strictly Necessary | No |
   | oauth_state | OAuth security | 10 minutes | Strictly Necessary | No |

3. **Strictly Necessary Cookies**
   - Detailed explanation
   - Why they can't be disabled
   - Impact of browser-level blocking

4. **Optional Cookies**
   - Currently: None
   - Future: Will require separate consent

5. **Third-Party Cookies**
   - Currently: None
   - Note: Google OAuth handled server-side

6. **Managing Cookies**
   - Browser-level instructions
   - Consequences of disabling
   - How to contact us

7. **Updates to This Policy**
   - Notification process
   - Version tracking

8. **Contact Information**

### Privacy Policy Updates

**Section 7 Enhancements:**

- Expand cookie explanation
- Link to detailed cookie policy
- List all cookies in table
- Explain consent process
- Note about strictly necessary cookies

## Implementation Phases

### Phase 1: Core Implementation (Priority)

1. ✅ Create GDPR_COOKIE_PLAN.md
2. ⬜ Create `lib/cookieConsent.ts`
3. ⬜ Create `hooks/useCookieConsent.ts`
4. ⬜ Create `components/CookieConsentBanner.tsx`
5. ⬜ Create `routes/cookies.tsx`
6. ⬜ Update `routes/privacy.tsx`
7. ⬜ Add banner to app layout
8. ⬜ Add consent checks to auth flows

### Phase 2: Enhanced Features (Future)

1. ⬜ Account settings: Cookie preferences section
2. ⬜ Consent version tracking and renewal
3. ⬜ Admin dashboard: Consent metrics
4. ⬜ Multi-language support
5. ⬜ Cookie consent for future analytics (if added)

## Testing Checklist

- [ ] Banner appears for new visitors
- [ ] Banner dismisses after consent
- [ ] Banner doesn't reappear after consent
- [ ] Signup blocked without consent
- [ ] Login blocked without consent
- [ ] OAuth flow blocked without consent
- [ ] Consent persists across sessions
- [ ] Cookie policy page accessible
- [ ] Privacy policy updated and linked
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Mobile responsive design
- [ ] Reduced motion respected
- [ ] localStorage unavailable handling

## Accessibility Requirements

- **Keyboard Navigation:** All interactive elements focusable and operable
- **Screen Readers:** Proper ARIA labels and landmark roles
- **Focus Management:** Clear focus indicators
- **Color Contrast:** WCAG AA compliance minimum
- **Reduced Motion:** Disable animations when preferred
- **Touch Targets:** Minimum 44x44px for mobile

## Performance Considerations

- Lazy load banner component
- Minimal JavaScript footprint
- No layout shift (CLS = 0)
- Fast localStorage access
- Debounced state updates
- Efficient re-render prevention

## Future Considerations

### If Adding Analytics

- Separate "Analytics Cookies" category
- Opt-in checkbox in banner
- Update cookie policy with analytics cookies
- Implement cookie blocking until consent
- Add preference toggle in settings

### If Adding A/B Testing

- "Performance Cookies" category
- Similar opt-in mechanism
- Document test cookies in policy

### If Operating in EU

- Consider Data Protection Officer (DPO)
- Data Processing Agreement with processors
- Verify AI provider GDPR compliance
- Implement data retention policies
- Regular compliance audits

## Resources

- **GDPR Official:** <https://gdpr.eu/cookies/>
- **ICO Cookie Guidance:** <https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/>
- **Current Privacy Policy:** `/privacy`
- **Current Terms of Service:** `/terms`

## Notes

- Strictly necessary cookies don't require consent under GDPR
- Best practice: Inform users anyway
- Authentication cookies fall under "strictly necessary"
- OAuth state cookies are security-critical
- No tracking/analytics cookies currently used
- No third-party cookies except OAuth (server-side)

## Version History

- **v1.0** (November 17, 2025): Initial implementation plan
