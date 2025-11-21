# UX Design Guidelines — LancerScape

These guidelines keep the product consistent, accessible, and predictable across the platform. They are high-level rules of thumb for designers and developers.

---

## Typography
- Establish a clear type scale (H1 → H6, body, small) and stick to it across screens. Use 3–5 distinct sizes for hierarchy.
- Headline rules:
  - H1: page/topic title (prominent, single line when possible).
  - H2/H3: section headings (clear grouping).
  - H4+: secondary labels, cards, metadata.
- Body text:
  - Primary body for content and forms (readable at normal desktop sizes).
  - Secondary/smaller copy for captions, hints, timestamps.
- Line length and spacing:
  - Aim for 50–75 characters per line for readable paragraphs.
  - Use 1.3–1.6 line-height for body; slightly tighter for UI labels.
- Weight & emphasis:
  - Use bold sparingly for emphasis (titles, important numbers).
  - Use color + weight for emphasis rather than excessive size changes.
- Accessibility:
  - Maintain contrast ratios that meet WCAG AA minimum (4.5:1 for body text). For large text (≥18pt or bold ≥14pt), 3:1 is acceptable.
  - Allow font-size scaling (respect user browser/device settings).

---

## Buttons
- Variants (clear naming): Primary (affirmative), Secondary (less priority), Ghost/Link (low priority), Danger (destructive).
- Sizes: Provide small, medium (default), and large (prominent CTAs). Ensure touch targets ≥ 44x44 px on mobile.
- Placement & ordering:
  - Place primary action on the right (modal footer, form submit).
  - Secondary/Cancel left, link/cancel low-contrast.
- States:
  - Idle, Hover/Focus (visual highlight), Pressed (subtle depth/tonal change), Disabled (muted and non-interactive).
  - Provide visual focus ring for keyboard navigation.
- Copy:
  - Use verb-first, concise labels: “Publish Project”, “Fund Milestone”, “Request Revision”.
  - Avoid ambiguous copy like “Submit” without context — prefer “Submit Work for Milestone X”.
- Confirmation:
  - For destructive or high-value actions (release funds, refund), require a confirmation dialog and show the exact outcome.

---

## Form inputs
- Labeling:
  - Always show a persistent label above the field (not just placeholder).
  - Provide short helper text under the field when needed.
- Placeholders:
  - Use placeholders for examples, not as substitutes for labels.
- Grouping:
  - Group related fields into sections with H3/H4 headings and optional stepper for long forms.
- Validation:
  - Validate inline on blur and show succinct error messages tied to the field.
  - Error copy should explain the issue and how to fix it (e.g., “Amount must be a positive number”).
  - Use success states sparingly (e.g., checkmark on upload complete).
- Required fields:
  - Mark required fields clearly and avoid too many required inputs on a single step.
- Accessibility:
  - Inputs must have associated labels and aria-invalid when errors exist.
  - Announce errors and form submission status to screen readers.
- File uploads:
  - Show accepted file types and size limits before upload.
  - Provide progress bars, previews, and ability to cancel uploads.

---

## Error / Success messages
- Tone & placement:
  - Error messages: clear, direct, non-accusatory. Place near the related UI element or as a prominent banner for global errors.
  - Success messages: brief confirmation with next step guidance.
- Persistence:
  - Critical errors that block flow should remain until dismissed or resolved. Transient success messages may auto-dismiss after 3–5 seconds with an optional CTA.
- Actionable guidance:
  - Always include the next action (e.g., “Try again”, “Contact support”, “Upload a different file”).
- System vs user errors:
  - Differentiate system errors (server unavailable) vs user errors (invalid input). Use different tones and recovery suggestions.
- Audit and logging:
  - For financial failures, surface an error code and link to support or internal audit details.

---

## Empty states
- Purpose: Teach and guide — every empty state is an opportunity to help the user take an action.
- Content:
  - Short title explaining what’s missing.
  - One-sentence description of why it’s empty and a suggested next step.
  - Primary CTA (e.g., “Create Project”, “Post First Job”, “Add Milestone”).
  - Optional secondary CTA: “Learn more” or “Import data”.
- Visuals:
  - Use subtle illustrations or icons (not decorative noise) to convey context.
- Contextual placement:
  - If an empty state is the result of a filter, provide a clear way to reset filters.

---

## Loading states
- Non-blocking loads:
  - Use skeletons for content-heavy pages (cards, lists) to maintain layout context.
  - Use inline progress indicators for small async actions.
- Blocking loads:
  - For actions that must complete before proceeding (on‑chain signature confirmation), show a focused modal or overlay with status and expected wait time.
- Progress feedback:
  - If possible, present meaningful progress (percentage, confirmation steps) instead of an indefinite spinner.
- Error fallback:
  - If loading fails, show an inline retry CTA and diagnostic information (e.g., “Couldn’t load transactions — Retry”).

---

## Light / Dark mode behavior
- Token parity:
  - Maintain the same semantic color tokens across modes (bg-surface, text-primary, border-muted, accent). Color values change but semantics remain.
- Contrast:
  - Ensure contrast ratios are preserved in both modes — adjust color accents to keep legibility.
- Elevation and depth:
  - Use subtle elevation or overlays in dark mode (soft glows or slightly lighter surfaces) rather than large color shifts.
- Assets & icons:
  - Provide two variants for icons/illustrations where needed (or use neutral shapes that adapt).
- Motion and readability:
  - Prefer reduced motion option; ensure shadows and glows are not overwhelming in dark mode.
- Consistency:
  - Toggle should preserve user preference and respect OS-level settings by default.

---

## Mobile responsiveness
- Layout patterns:
  - Collapse sidebars into bottom or top navigation. Use full-width stacked content for cards and forms.
  - Keep primary CTA sticky (bottom bar) on long forms or review pages.
- Touch targets:
  - Minimum target size 44x44 px. Give adequate spacing between tappable elements.
- Forms:
  - Use single-column forms; group fields and reduce required typing where possible (smart defaults).
- Navigation:
  - Use a compact topbar with hamburger/menu and prominent wallet/connect CTA.
- Performance:
  - Optimize images and assets for mobile. Use progressive loading and prioritize critical content.
- Behavior parity:
  - Preserve functional parity with desktop but simplify complexity (collapse advanced options into “More”).
- Offline & connectivity:
  - Gracefully handle poor connectivity; allow saving drafts locally and retrying uploads.

---

## Dashboard layout (practical rules)
- Hierarchy & focus:
  - Lead with the single most important KPI or CTA (e.g., “Active Projects” or “Fund Escrow”).
  - Keep the top row to 3–4 key metrics; avoid clutter.
- Cards:
  - Use consistent card sizing and spacing. Allow cards to expand into detail overlays (slideovers) instead of navigation away.
- Density:
  - Provide a medium-density default; offer a compact mode for power users, but not at the expense of readability.
- Prioritization:
  - Sort content by urgency: Pending milestones, Awaiting approvals, High‑priority disputes, Recent messages.
- Actions:
  - Include context-specific quick actions on cards (Approve, Fund, Message) so users can act quickly.
- Personalization:
  - Allow users to pin or reorder widgets for their workflow.
- Responsiveness:
  - On narrow viewports, convert side panels into accordion sections that collapse.

---

## Dispute evidence previews (UX rules)
- Visual summary first:
  - Present a compact preview (thumbnail, snippet, or summary) and metadata (uploader, timestamp, type, hash/tx id).
- Prioritize relevance:
  - Surface AI-assigned relevance or confidence badges next to each piece of evidence.
- Safe viewing:
  - Provide a secure viewer that can open files in-place; allow downloading only if permissioned.
- Redaction & privacy:
  - Support redaction tools for PII when evidence contains sensitive data; indicate redactions visually and log who redacted.
- Versioning & provenance:
  - Show provenance metadata: source (chat/attachment/wallet tx), checksum, upload history, and any processing (OCR, transcript).
- Interaction affordances:
  - Allow annotating evidence (highlight/comment), flagging suspicious items, and adding counter‑evidence inline.
- Compact vs expanded:
  - Use small evidence cards in lists; allow expanding to a detailed pane with full metadata and playback (if audio/video).
- Bulk operations:
  - Allow downloading uploads in bulk for administrators, with a clear audit trail.
- Accessibility:
  - Provide alt text, transcripts for audio/video, and textual summaries for complex evidence.

---

## Cross-cutting principles
- Predictability: Always show the result of user actions (success, failure, pending) and next steps. For financial actions, show exact amounts, fees, and transaction ids.
- Recoverability: Provide undo where safe (e.g., un-assign draft changes), and clear error recovery paths.
- Minimal surprises: Surface consequences before executing irreversible actions (releasing funds, suspending accounts).
- Consistent language: Use a single voice and terminology (e.g., “milestone”, “submission”, “escrow”) across UI and help docs.
- Auditability: For admin workflows and financial changes, record and present audit logs alongside actions.
- Accessibility first: Keyboard focus, screen reader announcements, color contrast, and text alternatives must be baked into component design.
- Performance: Prioritize perceived performance — skeletons, progressive content rendering, and optimistic UI for non-critical changes.

---

*Generated on 2025-11-21*
