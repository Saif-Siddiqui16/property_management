# System Audit Report

## Summary
- Total requirements checked: 14
- Fully implemented: 6
- Partially implemented: 5
- Not implemented: 3

---

## ✅ Fully Implemented
- **Requirement**: Tenant creation must NOT require Building, Unit, Room.
  - **Evidence**: [tenant.controller.js](file:///c:/Users/Admin/Desktop/property_new_clone/property-saif/src/modules/admin/tenant.controller.js#L158-L250) - All location fields are optional in `createTenant`.
- **Requirement**: Three distinct entities: Individual Tenant, Company Tenant, Resident (occupant).
  - **Evidence**: [Tenants.jsx](file:///c:/Users/Admin/Desktop/property_new_clone/frontend/src/pages/Tenants.jsx#L531-L575) - Type selection stage explicitly defines these three types.
- **Requirement**: Form titles and UI labels must match the entity being created.
  - **Evidence**: [Tenants.jsx](file:///c:/Users/Admin/Desktop/property_new_clone/frontend/src/pages/Tenants.jsx#L509-L515) - Dynamic headers based on `tenantType`.
- **Requirement**: Residents must be linkable to a billable tenant.
  - **Evidence**: [Tenants.jsx](file:///c:/Users/Admin/Desktop/property_new_clone/frontend/src/pages/Tenants.jsx#L640-L662) - Resident Linking section uses `selectedParentId`.
- **Requirement**: Newly created residents must appear in lease dropdowns.
  - **Evidence**: [LeaseForm.jsx](file:///c:/Users/Admin/Desktop/property_new_clone/frontend/src/pages/LeaseForm.jsx#L39-L50) - Fetches all tenants; [tenant.controller.js](file:///c:/Users/Admin/Desktop/property_new_clone/property-saif/src/modules/admin/tenant.controller.js#L43-L85) - Formats both tenants and residents for general listing.
- **Requirement**: SMS / Email credentials must NOT be sent automatically on creation.
  - **Evidence**: [tenant.controller.js](file:///c:/Users/Admin/Desktop/property_new_clone/property-saif/src/modules/admin/tenant.controller.js#L282) - Logic removed from creation flow.

---

## ⚠️ Partially Implemented
- **Requirement**: Invitations must be optional, manually triggered, and sent only after lease creation.
  - **What works**: Credentials-sending moved to lease creation. Manual "Send Invite" button exists on Tenant list.
  - **What is missing**: Credential SMS/Email is currently *automatically* sent upon lease creation in `lease.controller.js`, rather than being a manual togglable option during or after that process.
  - **Location in code**: [lease.controller.js:L659-L705](file:///c:/Users/Admin/Desktop/property_new_clone/property-saif/src/modules/admin/lease.controller.js#L659-L705)
- **Requirement**: Lease creation must allow selecting a Resident and a Billable Tenant separately.
  - **What works**: Backend `createLease` correctly redirects billing to the parent if a resident is selected.
  - **What is missing**: Frontend `LeaseForm.jsx` only allows selecting one "Primary Tenant". It relies on the pre-existing Resident -> Parent link rather than allowing ad-hoc selection of both.
  - **Location in code**: [LeaseForm.jsx](file:///c:/Users/Admin/Desktop/property_new_clone/frontend/src/pages/LeaseForm.jsx)
- **Requirement**: Validation errors must be specific, actionable, and shown inline.
  - **What works**: `Tenants.jsx` shows specific inline errors for names, email, and phone.
  - **What is missing**: Other forms (e.g., Lease creation, Invoicing) still use generic `alert` messages for most failures.
  - **Location in code**: [LeaseForm.jsx:L138](file:///c:/Users/Admin/Desktop/property_new_clone/frontend/src/pages/LeaseForm.jsx#L138)
- **Requirement**: Backend must return structured validation errors with correct HTTP codes.
  - **What works**: `tenant.controller.js` uses `AppError` (400) with an `errors` object.
  - **What is missing**: Standard not implemented across all modules (e.g., `invoice.controller.js` often returns generic 400/500).
- **Requirement**: No silent failures in messaging.
  - **What works**: `lease.controller.js` now reports notification status back to the frontend.
  - **What is missing**: `Tenants.jsx` "Send Invite" (manual) does not explicitly report if the backend *failed* to send; it only alerts the generated link.
  - **Location in code**: [Tenants.jsx:L320](file:///c:/Users/Admin/Desktop/property_new_clone/frontend/src/pages/Tenants.jsx#L320)

---

## ❌ Not Implemented
- **Requirement**: Invitation status should support: Draft, Pending, Invited.
  - **Expected behavior**: A designated field or status indicator in the UI showing the state of the invitation.
  - **Actual behavior**: No `invitationStatus` exists; system only tracks `inviteToken` presence/expiry.
  - **Location in code**: `schema.prisma` (User model), `Tenants.jsx`.
- **Requirement**: SMS must clearly indicate whether replies are supported.
  - **Expected behavior**: SMS text includes "Replies not monitored" or similar.
  - **Actual behavior**: SMS template is a generic welcome message.
  - **Location in code**: [lease.controller.js:L687](file:///c:/Users/Admin/Desktop/property_new_clone/property-saif/src/modules/admin/lease.controller.js#L687)
- **Requirement**: UI must clearly indicate how emails can be sent.
  - **Expected behavior**: Visual markers or tooltips explaining the email dispatch mechanism.
  - **Actual behavior**: Standard action buttons without explanatory indicators.
  - **Location in code**: `Tenants.jsx`, `Communication.jsx`.

---

## 🚨 High-Risk Issues
1. **Automation Over-Reach**: Credentials are sent *automatically* upon any lease creation for a new tenant. This contradicts the "Optional/Manual" requirement and could lead to premature or unwanted notifications.
2. **Billing Visibility**: The lack of a "Billable Tenant" selector in the Lease Form (distinct from the primary occupant) makes it unclear to the admin who will actually be invoiced until the invoice is generated.
3. **Validation Gaps**: While Tenant creation has improved validation, the Lease and Invoice modules still lack robust, inline error reporting, leading to a frustrating "Something went wrong" experience for complex edge cases.

---

## Notes
- No code was modified
- This report is read-only
