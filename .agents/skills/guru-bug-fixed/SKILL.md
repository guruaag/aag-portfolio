---
name: guru-bug-fixed
description: Comprehensive ledger of all resolved bugs, regressions, failure patterns, root causes, pending issues, and verification procedures for the Gurupratap Sharma 'Aag' Portfolio project. Use to record new bugs or audit the codebase against past regressions.
---

# Guru Bug Fixed Ledger & Master Audit Standard

This skill serves as the master register of all technical bugs, regressions, runtime exceptions, schema mismatches, i18n glitches, and layout issues discovered across the Gurupratap Sharma 'Aag' website (public site and admin dashboard) since inception.

## Execution Workflows

Whenever this skill is triggered, execute or offer the following modes:

1. **Record New Bug ("Record Bug / नया बग दर्ज करें")**:
   - Document the bug symptom/error message, affected component/route, root cause, exact fix applied, and git commit hash.
   - Synthesize a regression prevention rule and append it under the **Known Bugs & Fixed Ledger** section.
   - Update this `SKILL.md` file.

2. **Run Comprehensive Bug Audit ("Run Bug Audit / बग ऑडिट चलाएं")**:
   - Scan active codebase files across `src/components/`, `src/pages/`, `src/styles/`, and `src/utils/`.
   - Run strict checks against all rules listed in the ledger below.
   - Execute `npm run build` to guarantee 0 build or bundling errors.
   - Output a structured audit compliance report indicating status (PASSED/FAILED) per category.

---

## Technical Audit & Verification Rules

1. **Top-Level Scope & Function Declaration Audit**:
   - Verify every helper function, state variable, or utility referenced in JSX (e.g. `renderLabelWithToggle`, `tLabel`, `hasError`, `sanitizePoem`, `parseYearNumber`) is explicitly declared within component scope or imported at top-level.
2. **Resilient Data Iteration & Defensive Array Safeguards**:
   - Never invoke `.map()`, `.forEach()`, or `.length` directly on asynchronous data responses without defensive checks (`const safeArray = Array.isArray(data) ? data : []`).
3. **Database Thenables & Exception Resilience**:
   - Supabase Postgrest query builders are Thenable objects but lack native `.catch()`. Always wrap DB calls inside `async/await` try-catch blocks or `Promise.resolve(...)`.
4. **Channel Visibility Settings Guards**:
   - Every social or contact link rendered on public pages (`Contact.jsx`, `Footer.jsx`, `ContactModal.jsx`, `FollowModal.jsx`) must check `isChannelVisible(key)` / `isSocialVisible(key)` using `enable_[key]` settings.
5. **i18n Context Destructuring**:
   - Always destructure `i18n` alongside `t` when invoking `useTranslation()` if language changes trigger reactive UI rerenders (`const { t, i18n } = useTranslation()`).
6. **Clean Devanagari Typography**:
   - Interface labels in Hindi mode must use pure Devanagari text without trailing English parenthetical translations (e.g., `"संदेश भेजें"` instead of `"सीधा संदेश भेजें (Direct Message)"`).
7. **Production Bundle Build Integrity**:
   - `npm run build` must complete cleanly with exit code 0.

---

## Complete Known Bugs & Fixed Ledger (Since Inception)

### Category A: Admin Dashboard & Scope Errors

#### A1. `ReferenceError: renderLabelWithToggle is not defined` (`Dashboard.jsx`)
- **Symptom**: Admin dashboard crash (`Page Error: renderLabelWithToggle is not defined`) when loading `/admin/sampark`.
- **Root Cause**: `renderLabelWithToggle` was used in JSX inside `ContactInfoForm` before being defined within that component scope.
- **Fix Applied**: Inserted `renderLabelWithToggle` function definition inside `ContactInfoForm` in `src/pages/Admin/Dashboard.jsx` (Commit `6d569aa`).
- **Regression Rule**: Every helper function called inside component JSX must be declared within the component body or imported at module top level.

#### A2. `ReferenceError: let hasError` missing in `HomeManager`
- **Symptom**: Uncaught runtime exception when attempting to submit `HomeManager` form on invalid inputs.
- **Root Cause**: `hasError` variable was checked in error handling branch without prior `let hasError = false` initialization.
- **Fix Applied**: Explicitly initialized `let hasError = false` inside `HomeManager` submit handler (Commit `c5d2df4`).
- **Regression Rule**: Ensure error validation flags are explicitly initialized before conditional assignments.

#### A3. Missing Component Definition Crashes in `InboxManager` and `AwardsManager`
- **Symptom**: Admin dashboard tab crash when clicking Inbox or Awards sub-tabs.
- **Root Cause**: Component definitions were accidentally stripped or truncated during a bulk refactor pass.
- **Fix Applied**: Restructured `Dashboard.jsx` to restore complete, isolated definitions for all 13 core manager components (Commit `9826109`).
- **Regression Rule**: Never remove or rename core manager component functions in `Dashboard.jsx` without verifying full module exports.

#### A4. `HomeManager` JSON Parse Crash on Invalid Input
- **Symptom**: Admin page white screen crash when editing hero or banner JSON settings.
- **Root Cause**: Direct `JSON.parse(str)` invocation on malformed or empty text input without a fallback block.
- **Fix Applied**: Wrapped all `JSON.parse` calls in safe try-catch handlers returning default fallback objects `{}` / `[]` (Commit `919508d`).
- **Regression Rule**: Never parse JSON strings directly without wrapping in a try-catch fallback wrapper.

#### A5. `AboutManager` Timeline `setIsDirty` State Leak
- **Symptom**: Navigating away from About Manager prompted false "Unsaved changes" warnings even after saving.
- **Root Cause**: Timeline event sub-forms did not propagate `setIsDirty(false)` on successful database updates.
- **Fix Applied**: Added explicit `setIsDirty(false)` call to timeline save handler in `Dashboard.jsx` (Commit `919508d`).
- **Regression Rule**: Every successful form save must explicitly reset `setIsDirty(false)`.

---

### Category B: Database, Schemas & Syncing

#### B1. `PGRST204` Schema Mismatch on `contact_submissions` Table
- **Symptom**: Public contact form submissions failed with 400 Bad Request error.
- **Root Cause**: Database table `contact_submissions` had strict column constraints mismatching the payload keys (`full_name` vs `name`).
- **Fix Applied**: Aligned payload key names with table columns and created SQL migration script (Commit `4b3ba92`).
- **Regression Rule**: Database payload keys must match exact column names defined in Supabase schema migrations.

#### B2. Public `/category/about` Page "Content Not Available" Error
- **Symptom**: Public About page displayed "Content not available Refresh" despite data existing in Supabase.
- **Root Cause**: Strict, un-guarded Postgrest query in `CategoryDetail.jsx` threw an exception when category metadata or timeline rows were returned in non-standard formats.
- **Fix Applied**: Added error-resilient queries with defensive category resolution and safe default objects in `CategoryDetail.jsx` (Commit `43afe1b`).
- **Regression Rule**: Data fetch handlers must catch Postgrest exceptions gracefully and render fallback content instead of breaking the entire route.

#### B3. Timeline & Awards Data Invisible on About Page
- **Symptom**: Timeline and Awards sections were blank on `/category/about` page.
- **Root Cause**: Missing imports for `getTimeline` and `getAwards` helper functions in `CategoryDetail.jsx`.
- **Fix Applied**: Imported `getTimeline` and `getAwards` from `supabaseClient.js` and wired them to state (Commit `b797ab6`).
- **Regression Rule**: Run static component import audits to verify all data accessor functions are explicitly imported.

#### B4. Social & Contact Channel Visibility Syncing Failure
- **Symptom**: Toggling a contact or social channel off in `/admin/sampark` (`[✓] Show on site`) did not hide the channel from public contact cards or footer icons.
- **Root Cause**: Public components (`Contact.jsx`, `Footer.jsx`, `ContactModal.jsx`, `FollowModal.jsx`) rendered all channels statically without inspecting `enable_[key]` settings.
- **Fix Applied**: Created `isChannelVisible(key)` and `isSocialVisible(key)` helpers across all public components (Commit `b255a6d`).
- **Regression Rule**: All public contact & social channels must verify `enable_[key] === 'true'` setting before rendering.

---

### Category C: Public Site UI, UX & Reader Components

#### C1. Extra Text & Widget Clutter in Book Reader Header/Footer
- **Symptom**: Opening a book in focus mode displayed cluttered parent page text (e.g. `← वापस अफ्तेर...`, `दोस्तों ये राजनीति...`, font resize buttons) in header and footer.
- **Root Cause**: `BookReader.jsx` rendered unconstrained parent page category headers and raw stanza strings simultaneously.
- **Fix Applied**: Replaced `BookReader` modal logic with `PoetryFocusView` modal component for 100% clean modal parity across poetry and books (Commit `24e332d`).
- **Regression Rule**: Focus readers must isolate modal controls into dedicated sticky header bars and render content without leaking parent page DOM elements.

#### C2. Hindi Contact Page Parenthetical English Text
- **Symptom**: Contact page displayed unwanted text `"आप सीधे संदेश भेजकर..."` and parenthetical English terms (`(Phone)`, `(WhatsApp)`) in Hindi mode.
- **Root Cause**: Hardcoded bilingual string constants in `Contact.jsx`.
- **Fix Applied**: Cleaned Hindi copy matrix, updated form title to `"संदेश भेजें"`, and removed obsolete subtitle (Commit `c14c172`).
- **Regression Rule**: Devanagari UI copy must contain no trailing English parenthetical translations.

#### C3. Missing YouTube Channel Card
- **Symptom**: YouTube channel links were missing from `/contact` page cards and admin contact form.
- **Root Cause**: `youtube` key was missing from default channel lists.
- **Fix Applied**: Added YouTube input to admin `ContactInfoForm` and added YouTube channel card to `Contact.jsx` with default fallback URL (Commits `c14c172`, `eb10c91`).
- **Regression Rule**: Support all 8 core contact & social channels (`phone`, `whatsapp`, `email`, `facebook`, `instagram`, `twitter`, `linkedin`, `youtube`) symmetrically.

#### C4. Unconstrained Author Profile Image Overflow
- **Symptom**: Author photo in "कवि परिचय" section on home page overflowed vertically on desktop screens.
- **Root Cause**: Missing max-height constraint on `.author-profile-img` CSS class.
- **Fix Applied**: Added `max-height: 420px; object-fit: cover; border-radius: 12px;` to `HeroSection.css` (Commit `633b78b`).
- **Regression Rule**: All hero/profile image elements must enforce explicit `max-height` and `object-fit: cover`.

#### C5. Screenshot / Broken Image Fallback Infinite Loop
- **Symptom**: Invalid image URLs (e.g. containing `media_` or `screenshot`) caused infinite re-triggering of `onError` handlers, causing browser slowdown.
- **Root Cause**: Image `onError` handler reassigned `e.target.src` without setting `e.target.onerror = null`.
- **Fix Applied**: Updated all image error handlers to disable re-entry (`e.target.onerror = null; e.target.src = '/logo.png';`) (Commit `59d6221`).
- **Regression Rule**: Image `onError` callbacks MUST clear `e.target.onerror = null` before setting fallback `src`.

#### C6. WhatsApp Share URL Cross-Platform Deep-Linking Failure
- **Symptom**: Clicking WhatsApp share link on desktop browsers showed blank page or failed to launch web client.
- **Root Cause**: Static `wa.me/` link used unconditionally instead of browser/mobile target checking.
- **Fix Applied**: Dynamically construct `https://web.whatsapp.com/send` for desktop and `https://api.whatsapp.com/send` / `wa.me` for mobile devices (Commits `020ace5`, `4e88955`).
- **Regression Rule**: WhatsApp sharing links must evaluate user agent to select between desktop web client and mobile deep-linking URLs.

---

### Category D: Font Engine & PageMaker 5.0 (PM5) Archives

#### D1. Kruti Dev 010 Character Mapping Gaps (`'k`, `'`, `â`)
- **Symptom**: Converted PageMaker 5.0 poems rendered missing characters or question marks for specific Hindi conjuncts (e.g. श, श्, म).
- **Root Cause**: Missing ASCII lookup key mappings in `krutiDevEngine.js`.
- **Fix Applied**: Added `'k` (श), `'` (श्), `â` (म), and Nukta (+) letter resolution (ड़, ढ़, ज़, फ़) to `krutiDevEngine.js` (Commits `b385bbe`, `1bd3814`).
- **Regression Rule**: Font conversion engine dictionary must cover all standard and extended Kruti Dev 010/022 ASCII glyph mappings.

#### D2. Token Split Regex Preserving Quotations & Brackets
- **Symptom**: Kruti Dev auto-paste converter stripped single quotes and brackets from stanza text.
- **Root Cause**: Token split regular expression matched punctuation characters aggressively.
- **Fix Applied**: Updated token split regex to preserve quotes, brackets, and Devanagari punctuation (Commit `5f9c1ac`).
- **Regression Rule**: Font conversion tokenizers must preserve all punctuation marks and whitespace layout formatting.

#### D3. PM5 Fullscreen Canvas Overlapping Toolbar & Clipping
- **Symptom**: PM5 fullscreen editing canvas clipped top lines on small laptops and exit button overlapped text formatting controls.
- **Root Cause**: Hardcoded top offset positioning and inline exit button z-index collision.
- **Fix Applied**: Implemented React `createPortal` overlay breakout with body scroll lock, sticky top toolbar, and bottom exit button placement (Commits `da9e438`, `4464117`, `166b9d0`).
- **Regression Rule**: Fullscreen canvas tools must use React `createPortal` targeting `document.body` with fixed full viewport bounds (`100vw` x `100vh`).

---

### Category E: i18n & Translation Runtime Errors

#### E1. `ReferenceError: useTranslation` Missing `i18n` Destructuring
- **Symptom**: Changing site language threw runtime error in Footer and Publication cards.
- **Root Cause**: Components called `i18n.language` without destructuring `i18n` from `useTranslation()`.
- **Fix Applied**: Updated `Footer.jsx`, `CategoryDetail.jsx`, and `PublicationCard.jsx` to destructure `{ t, i18n } = useTranslation()` (Commit `c3107a4`).
- **Regression Rule**: Always destructure `i18n` whenever inspecting `i18n.language` in React components.

---

## Pending & Monitored Technical Items

The following items are actively monitored for performance or future optimization:

1. **PM5 Extremely Large Document Rendering (< 50 Pages)**:
   - *Status*: Monitored.
   - *Detail*: Stanzas with > 50 pages in PM5 Canvas may see slight lag when switching stanzas rapidly on low-end devices. Virtualized line rendering can be implemented if document lengths grow significantly.
2. **Realtime Tab Syncing for Admin Channel Toggles**:
   - *Status*: Monitored.
   - *Detail*: Toggling channel visibility in `/admin/sampark` currently reflects on public pages upon user navigation or page refresh. Realtime Supabase websocket subscription can be enabled if instant cross-tab sync is requested.
3. **Large Production Bundle Warning**:
   - *Status*: Monitored.
   - *Detail*: Production JS bundle `dist/assets/index-*.js` is ~770kB minified. Code-splitting via dynamic `import()` for PM5 Canvas and Admin sub-modules can be added for faster initial public load.

---

## Quick Audit Command Protocol

To run a fast sanity audit against all rules in this ledger:
1. Run `npm run build`
2. Audit JSX files for missing scope imports or un-guarded array maps.
3. Verify zero unhandled promise rejections.
