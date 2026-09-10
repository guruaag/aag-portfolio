---
name: numanager-implementation-and-testing-standard
description: NuManager Implementation and Testing Standards based on past failure lessons, quality checklists, and review procedures.
---

# NuManager Implementation & Testing Standard

This skill encapsulates the authoritative engineering, architectural, and testing standards for the project, distilled from past failure root causes and technical iterations.

## Execution Workflow

Whenever this skill is triggered, immediately ask the user to select one of the following two modes:

1. **Update Standards ("Update / अद्यतन करें")**:
   - Review recent bugs, root causes, console trace errors, and architectural changes.
   - Synthesize technical learnings into actionable engineering rules.
   - Update this `SKILL.md` file with the newly discovered constraints and checklists.

2. **Review Implementation ("Review / समीक्षा करें")**:
   - Inspect recent git commits and modified files across `src/`.
   - Run a strict audit against all rules listed in this skill.
   - Generate a detailed review report confirming compliance or identifying potential regressions/edge-cases.

---

## Technical Standards & Quality Rules

### 1. Database & Asynchronous Operations
- **Supabase Thenables vs Native Promises**:
  - Never call `.catch()` directly on Postgrest query builders (e.g. `supabase.from('settings').select('*')`). Postgrest builders are Thenable objects but do not natively implement `.catch()`. Always wrap in an `async` function (e.g., `getAllSettings()`) or `Promise.resolve(...)`.
- **Resilient Multi-Tier Payloads**:
  - Always attempt primary database payloads using standard, verified column names (`heading`, `description`, `full_text`, `language`, `sort_order`).
  - Provide safe fallback handling so missing legacy columns never crash the application or prevent data saves.

### 2. Defensive UI & React Component Rules
- **Import Verification & Component Definitions**:
  - Ensure all JSX components used in render functions (e.g. `<Link>`, `<NavLink>`, `<PM5WritingDesk>`, `<PoemsArchiveManager>`, `<PublicationsManager>`, `<SettingsManager>`) are explicitly imported or defined at the top level of the module to prevent `ReferenceError` crashes.
- **Array Safeguards**:
  - Never evaluate `.length` or `.map()` directly on prop or state arrays without defensive guards (`const safeItems = Array.isArray(items) ? items : []`).
- **Global Error Boundaries**:
  - Ensure all routes are wrapped inside `ErrorBoundary` to gracefully handle unexpected runtime exceptions without displaying a blank white screen.
  - Fallback UI must respect the active user language selection (`localStorage.getItem('siteLanguage')`) rather than displaying mixed dual-language text.

### 3. Sticky Action Header & Single Action Container Rules
- **Standardized Form ID Binding**:
  - Every form element in manager components (`PoemsManager`, `AboutManager`, `PublicationsManager`, etc.) must use `id="admin-active-form"`.
  - The sticky top header submit button must use `<button type="submit" form="admin-active-form">` to trigger standard HTML form submission natively across all sub-views.
- **Consolidated Action Container (No Inline Action Buttons)**:
  - Page content bodies must NOT render duplicate inline edit or save buttons (e.g., inline `✏️ सम्पादित करें`). All forms must display input controls directly, maintaining a **single action container** located exclusively in the top-right sticky header area (`<button type="submit" form="admin-active-form">💾 सहेजें / अपडेट</button>`).
- **Optimistic UI Resequencing**:
  - Instant `⬆️ Move Up` / `⬇️ Move Down` resequencing actions must update the React local state array immediately before background Supabase calls finish to guarantee zero visual latency.
- **Unmount `isDirty` Cleanup**:
  - Unmounting any component or changing routes must explicitly reset `isDirty` state to `false` to avoid stale unsaved prompts when loading a new clean form.

### 4. PageMaker Canvas (PM5) & Formatting Rules
- **Flexible Canvas Boundaries**:
  - Support natural line wrapping ("Max characters per line: NA / Upto container capacity") and flexible page heights.
  - Auto-paginate long pasted text (~14 lines per page) across canvas pages without truncating characters per line.
- **Auto-Sync & Form Binding**:
  - Any edit in PM5 Canvas must set `isDirty = true` immediately.
  - Clicking sticky top header Save must auto-execute "Save & Apply Canvas" first before submitting payload to Supabase.

### 5. Layout & Navigation Architecture
- **Clean Two-Column Grid Shell**:
  - Fixed `260px` Left Sidebar + flexible main canvas area (`100vh`).
  - Strip public website headers (`<Header />`) from all `/admin/*` administrative routes.
- **Zero Top Margin Alignment**:
  - The top edge of `.admin-main-canvas` and `.admin-sticky-header` must align directly at `top: 0` with the top edge of `.admin-sidebar`. Public site layout rules (`.phoenix-main`) must be overridden for admin routes (`margin-top: 0 !important; padding-top: 0 !important;`).
- **Pure White High-Contrast Dark Sidebar Typography**:
  - Brand title text (`.admin-sidebar-brand *`), unselected main tabs (`.admin-tab-btn`), and unselected sub-menu links (`.admin-sub-tab-btn`) inside `.admin-sidebar` must use pure bright white (`#FFFFFF`) or high-visibility cream (`#F4EFE6`) text with `font-weight: 600+` and `opacity: 1` to guarantee 100% legibility against the dark `#1E1B18` background under all font-rendering engines.
- **Nested Sub-Category Navigation Tree**:
  - Place sub-category links (`.admin-sub-nav` & `.admin-sub-tab-btn`) directly within the primary Left Sidebar tree beneath their parent section rather than rendering duplicate horizontal pill tab rows across the top of main canvas workspace panels.
- **Responsive Mobile Drawer**:
  - Screen sizes `< 768px` must convert the 260px sidebar into a sliding drawer (`transform: translateX(-100%)` to `translateX(0)`), toggled via a mobile topbar hamburger button with a translucent backdrop overlay (`.admin-drawer-overlay`).
  - Navigating to any tab in the mobile drawer must auto-close the drawer state (`setMobileOpen(false)`).
- **Unsaved Changes Guard**:
  - Display custom bilingual modal ("Discard Changes / परिवर्तन छोड़ें" vs "Keep Editing / संपादन जारी रखें") before client-side navigation when `isDirty` is true.
  - Reset `isDirty` to `false` on form submit, cancel, or module unmount.

### 6. Verification & Pre-Commit Import Protocol
- **Static Import & Definition Audit**:
  - Before pushing any route or layout changes, run a full static import and component definition audit across `src/pages/Admin/Dashboard.jsx` and `src/App.jsx`. Never register or render a manager component without verifying its explicit import or top-level function definition in the file.
- **Multibyte UTF-8 Code Integrity**:
  - When editing files containing Hindi/Devanagari text, avoid truncating multibyte character sequences.
- **Mandatory Build Check**:
  - Always execute `npm run build` before declaring completion. Code changes are never considered complete until `npm run build` succeeds with 0 compilation errors.
