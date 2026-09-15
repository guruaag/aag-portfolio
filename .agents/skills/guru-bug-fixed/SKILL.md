---
name: guru-bug-fixed
description: Comprehensive ledger of resolved bugs, regressions, failure patterns, root causes, and verification procedures for the Gurupratap Sharma 'Aag' Portfolio project. Use to record new bugs or audit the codebase against past regressions.
---

# Guru Bug Fixed Ledger & Regression Verification

This skill serves as the central register of all technical bugs, regressions, runtime errors, and layout glitches discovered across the Gurupratap Sharma 'Aag' website (both public site and admin dashboard). It provides structured workflows for recording new fixes and auditing the codebase against re-emerging patterns.

## Execution Workflow

Whenever this skill is triggered, ask the user (or select based on context) one of the following two modes:

1. **Record New Bug ("Record Bug / नया बग दर्ज करें")**:
   - Document the bug symptom/error message, affected route/component, root cause, exact fix applied, and commit hash.
   - Synthesize a regression prevention rule and append it to the **Known Bugs & Fixed Ledger** section below.
   - Save updates to this `SKILL.md` file.

2. **Run Bug Audit ("Run Bug Audit / बग ऑडिट चलाएं")**:
   - Scan modified and active codebase files (`src/**/*.jsx`, `src/**/*.js`, `src/**/*.css`).
   - Run a strict audit against every rule listed in the **Known Bugs & Fixed Ledger**.
   - Execute `npm run build` to verify 0 build or bundling errors.
   - Generate a comprehensive audit report detailing pass/fail status for each bug check.

---

## Technical Audit & Verification Rules

Run these mandatory automated checks during a Bug Audit:

1. **Top-Level Variable & Function Scope Check**:
   - Verify all helper functions used in JSX (e.g. `renderLabelWithToggle`, `tLabel`, `sanitizePoem`) are defined within their component scope or imported before invocation.
2. **Channel Visibility Settings Integrity**:
   - Ensure all social and contact channels (`phone`, `whatsapp`, `email`, `facebook`, `instagram`, `twitter`, `linkedin`, `youtube`) check `isChannelVisible` / `isSocialVisible` guards using `enable_[key]` settings from Supabase.
3. **Database Thenables & Error Handling**:
   - Verify Supabase Postgrest query calls do not call `.catch()` directly on builder objects; ensure `async/await` try-catch blocks are used.
4. **Build & Bundle Verification**:
   - `npm run build` must complete with exit code 0.

---

## Known Bugs & Fixed Ledger

### 1. `ReferenceError: renderLabelWithToggle is not defined` (Admin / Sampark)
- **Symptom**: Admin dashboard crash (`Page Error: renderLabelWithToggle is not defined`) when loading `/admin/sampark`.
- **Root Cause**: The helper function `renderLabelWithToggle` was invoked in JSX inside `ContactInfoForm` but had not been defined within `ContactInfoForm` scope or imported.
- **Fix Applied**: Added `renderLabelWithToggle` definition inside `ContactInfoForm` in `src/pages/Admin/Dashboard.jsx`.
- **Regression Rule**: Every helper function called inside component JSX must be explicitly declared within the component or imported at module top level.

### 2. Timeline & Awards Data Invisible on About Page (`/category/about`)
- **Symptom**: Public site About page showed "Content not available / Content empty" even though data existed in Supabase `timeline_events` and `awards_honors` tables.
- **Root Cause**: Query mismatch and missing fallback array handling when mapping timeline and awards tables in `AboutPanel.jsx` and `CategoryDetail.jsx`.
- **Fix Applied**: Updated `AboutPanel.jsx` and `CategoryDetail.jsx` with defensive array fallbacks (`Array.isArray(...) ? ... : []`) and unified field mapping.
- **Regression Rule**: Always wrap Supabase array responses in defensive `Array.isArray()` checks before executing `.map()` or `.length`.

### 3. Extra Text Clutter in Book Reader Header & Footer
- **Symptom**: Top and bottom of Book Reader focus view displayed stray text (e.g., `← वापस अफ्तेर...`, `दोस्तों ये राजनीति...`, font resize controls, etc.) mixed into book/poetry modal views.
- **Root Cause**: `BookReader.jsx` and `PoemDetail.jsx` rendered unconstrained category headers and raw stanza strings simultaneously without separating modal controls from main content.
- **Fix Applied**: Restructured `BookReader.jsx` and `PoemDetail.jsx` focus modes to isolate reader controls into a clean sticky top bar.
- **Regression Rule**: Book focus views must use isolated reader headers and render book contents in clean paginated/scrolled containers without leaking parent page widgets.

### 4. Hindi Contact Page Parenthetical English Labels & Extra Text
- **Symptom**: Contact page displayed unwanted text `"आप सीधे संदेश भेजकर..."` and parenthetical English terms (`(Phone)`, `(WhatsApp)`, `(Facebook)`) in Hindi mode.
- **Root Cause**: Static strings in `Contact.jsx` contained hardcoded English parenthetical titles.
- **Fix Applied**: Stripped English parenthetical text, updated form header to `"संदेश भेजें"`, and removed obsolete subtitle in `src/pages/Contact.jsx`.
- **Regression Rule**: Hindi interface text must be pure Devanagari without trailing English parenthetical translations unless explicitly requested.

### 5. YouTube Channel Card Missing in Admin & Contact Page
- **Symptom**: YouTube channel was missing from contact cards on `/contact` page and admin contact settings `/admin/sampark`.
- **Root Cause**: `youtube` field was absent from `ContactInfoForm` initial state and `Contact.jsx` card render list.
- **Fix Applied**: Added `youtube` input field to `ContactInfoForm` in `src/pages/Admin/Dashboard.jsx` and created YouTube channel card in `src/pages/Contact.jsx`.
- **Regression Rule**: All 8 core channels (`phone`, `whatsapp`, `email`, `facebook`, `instagram`, `twitter`, `linkedin`, `youtube`) must be supported symmetrically in admin forms and public contact cards.

### 6. Channel Visibility Toggle (`[✓] Show on site`) Syncing
- **Symptom**: Hiding a contact or social channel in admin settings did not instantly hide it from footer icons, modals, or contact cards.
- **Root Cause**: Channel visibility flags (`enable_[key]`) were stored in database settings but ignored by `Footer.jsx`, `ContactModal.jsx`, `FollowModal.jsx`, and `Contact.jsx`.
- **Fix Applied**: Added `isChannelVisible(key)` and `isSocialVisible(key)` visibility helper guards across `Contact.jsx`, `Footer.jsx`, `ContactModal.jsx`, and `FollowModal.jsx`.
- **Regression Rule**: Channel visibility settings (`enable_[key] === 'true'`) must be checked before rendering any contact info or social media icon on any public page or modal.

### 7. Postgrest Query Builder `.catch()` Failure
- **Symptom**: Unhandled promise rejection error when Supabase queries failed.
- **Root Cause**: Calling `.catch()` directly on Postgrest query builder instances (which are Thenable objects, not native ES Promises).
- **Fix Applied**: Wrapped database calls in standard `async/await` functions with `try/catch` blocks across all manager components.
- **Regression Rule**: Never call `.catch()` directly on Supabase Postgrest builders; always use `async/await` with `try/catch`.

---

## Quick Audit Command Protocol

To perform a fast code audit against this ledger:
1. Run `npm run build`
2. Scan JSX files for undefined helper variables or un-guarded array iterations.
3. Report results cleanly.
