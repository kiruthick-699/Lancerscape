# LancerScape — Wireframes

Text-based wireframes for core pages. Each section lists: Page title, Suggested layout, Main sections/panels, Required components, Navigation items.

---

## Dashboard

- Page title: Dashboard
- Suggested layout: Three-column responsive grid — left sidebar (navigation), central content (primary), right column (context widgets). Topbar across entire app.
- Main sections / panels:
  - Topbar: global search, wallet connect, notifications, profile menu
  - Left sidebar: primary nav (Dashboard, My Projects, Marketplace, Messages, Disputes, Wallet, Settings)
  - Main area:
    - KPI row: Metric cards (Active projects, Escrow balance, Pending milestones, Open disputes)
    - Projects list section: cards or compact table with project title, status, next milestone, CTA
    - Activity feed / timeline: recent events (messages, submissions, payments)
  - Right column:
    - Quick actions (New Project, Fund Escrow, Invite Freelancer)
    - Upcoming deadlines widget
    - System alerts
- Required components: AppShell, Topbar, SidebarNav, MetricCard, ProjectCard, Timeline, Toasts, Pagination
- Navigation items: Topbar (Search, Notifications, Profile), Sidebar (Dashboard, Projects, Marketplace, Disputes, Wallet, Admin)

---

## Create Project (Wizard)

- Page title: Create Project (Wizard)
- Suggested layout: Centered multi-step panel with a vertical or horizontal stepper; optional help column on the right.
- Main sections / panels:
  - Stepper header showing steps: Basics → Milestones → Budget & Escrow → Screening → Review → Publish
  - Step content: the form fields for the current step (title, description, tags, attachments)
  - Side preview: live project preview (title, short blurb, estimated fees)
  - Bottom action bar: Back / Save Draft / Next / Publish
- Required components: Stepper/Wizard, Input/TextArea, Select/Combobox, FileUploader, Tag, EmptyState, Button, InlineAlert
- Navigation items: Breadcrumbs (Dashboard > Create Project), Topbar actions (Save Draft), Help link

---

## Milestone Creator

- Page title: Milestone Creator
- Suggested layout: Two-column with a main list (center) and summary sidebar (right) showing totals; drag-and-drop ordering in main column.
- Main sections / panels:
  - Milestones list (ordered cards): each card has title, due date, amount, acceptance criteria, edit/delete/duplicate controls, drag handle
  - Inline add/edit form or modal to create milestone
  - Budget summary (sidebar): total project budget, milestones total, warnings/overruns
  - Controls: Save milestones, Reorder, Finalize
- Required components: MilestoneCard, Draggable list, DatePicker, Currency Input, Modal, Button, Badge
- Navigation items: Back to Project, Fund Escrow, Publish

---

## Project Details

- Page title: Project Details
- Suggested layout: Two-column layout with main content left and contextual panels right; sticky header with project summary.
- Main sections / panels:
  - Header: Project title, client/freelancer badges, status, main CTAs (Message, Fund, Edit)
  - Left/Main:
    - Description and attachments
    - Milestones timeline/list with per-milestone actions (Fund, Submit, Dispute)
    - Proposals tab (client view) or Proposal composer (freelancer view)
    - Conversation/Chat (collapsible or docked)
  - Right:
    - Escrow snapshot and funding controls
    - Quick links (Files, Activity, Disputes)
    - Recent activity for this project
- Required components: Breadcrumbs, ProjectCard, MilestoneCard, Chat, Tabs, FileUploader/Viewer, TransactionList
- Navigation items: Project-level tabs (Overview, Milestones, Files, Proposals, Disputes), Topbar, Sidebar

---

## Escrow Funding Page

- Page title: Fund Escrow
- Suggested layout: Centered transaction flow with three logical panels: selection, payment method, confirmation; right-hand summary of fees and gas.
- Main sections / panels:
  - Milestone selector: choose which milestone(s) to fund, shows required amounts
  - Payment method selector: WalletConnect / Card / Bank / On‑chain options
  - Confirmation panel: fee breakdown, estimated gas/time, confirm button
  - Transaction status modal/panel: progress, tx id, receipt, retry on failure
- Required components: Select/Combobox, PaymentMethodSelector, ConfirmTransactionPanel, WalletConnectButton, Toasts, InlineAlert
- Navigation items: Breadcrumb (Project > Fund Escrow), quick back to Project Details

---

## Submit Work Page

- Page title: Submit Work
- Suggested layout: Single-column submission form with a large upload area, submission notes, and right-side checklist/auto-release options.
- Main sections / panels:
  - Milestone header (which milestone)
  - File upload area (drag-and-drop) with preview & versioning
  - Submission notes / acceptance checklist
  - Auto-release toggle and optional timer configuration
  - Submission history below (previous attempts, statuses)
- Required components: FileUploader, TextArea, Checklist component, Button (Submit, Save Draft), EvidenceCard, Timeline
- Navigation items: Back to Milestone, Project chat link

---

## Dispute Filing Page

- Page title: File a Dispute
- Suggested layout: Multi-step/wizard form (Context → Evidence → Resolution → Review), side help panel with rules and timelines.
- Main sections / panels:
  - Context: select project, milestone, submission, or transaction (prefilled when possible)
  - Dispute reason & narrative: reason selector + detailed description
  - Evidence uploader: structured evidence types (files, chat snippets, tx ids) with metadata fields
  - Resolution preference: dropdown/radio (refund/release/split/mediate)
  - Review & submit: summary of selected items and expected timeline
- Required components: Stepper, Select, TextArea, EvidenceUploader, EvidenceCard, RadioGroup, Button, InlineAlert
- Navigation items: Back to Project Details, View Open Disputes

---

## AI Dispute Summary Page

- Page title: AI Dispute Summary
- Suggested layout: Split view — left column with AI-generated summary and actions, right column with raw evidence / timeline; header shows confidence meter and model info.
- Main sections / panels:
  - AI summary card: short human-readable summary, confidence score, extracted facts
  - Suggested resolutions panel: recommended outcomes with confidence and rationale bullets
  - Evidence weighting: list evidence items with AI-assigned relevance/confidence badges
  - Response thread: allow parties to comment or accept suggestion
  - Action bar: Accept recommendation, Propose settlement, Request human review
- Required components: AISummaryPane, EvidenceCard, DisputeSummaryCard, Button, InlineAlert, Tooltip (for explainability)
- Navigation items: Link to Dispute Detail, Escalate to Admin

---

## Admin Dispute Review Panel

- Page title: Dispute Review (Admin)
- Suggested layout: Three-column layout — left queue/filters, center case viewer, right admin actions/audit.
- Main sections / panels:
  - Left: filterable disputes queue (risk badges, priority)
  - Center: full case view — dispute header, timeline, all evidence, AI summary collapsed/expanded, on-chain tx inspector
  - Right: ruling panel — form for outcome selection, rationale input, immediate action buttons (Release, Refund, Split, Hold), audit log
  - Bottom: post-ruling actions (notifications, ledger adjustments)
- Required components: Table (queue), Evidence viewer, AISummaryPane, AdminTableRow, ConfirmationDialog, AuditTrailViewer, ConfirmTransactionPanel
- Navigation items: Admin sidebar (Dashboard, Disputes, Users, Finance), filters for status/amount/date/risk

---

Notes (cross-page)

- Keep consistent AppShell (Topbar + Sidebar) for navigation continuity.
- Use clear status badges and timelines to convey escrow & dispute states.
- Ensure modals and slideovers are available for quick actions to avoid full page navigation.
- Always present primary action prominently and secondary actions unobtrusively.
- Provide visible timers and explicit consequences where auto-approve/timeout behaviors exist.


---

Generated on 2025-11-21
