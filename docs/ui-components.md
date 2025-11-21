# UI Component Catalogue — LancerScape

This file lists reusable UI components for the LancerScape app (Next.js + Tailwind + shadcn/ui). For each component: Name, Purpose, Props (concise), and Where to reuse.

---

## Core layout & navigation

1) AppShell
- Purpose: Top-level layout wrapper (topbar + sidebar + content container). Handles responsive layout and global context providers.
- Props: children: ReactNode; title?: string; showSidebar?: boolean; sidebarItems?: NavItem[]; topbarActions?: ReactNode
- Where reused: All pages (Dashboard, Project pages, Admin panels)

2) Topbar
- Purpose: Global header with search, notifications, wallet/connect actions and profile menu.
- Props: title?: string; onSearch?: (q: string) => void; notificationsCount?: number; onConnectWallet?: () => void; profileMenu?: ReactNode
- Where reused: AppShell, Dashboard, Project Details

3) SidebarNav
- Purpose: Primary application navigation with nested items and active state.
- Props: items: NavItem[]; currentPath?: string; onNavigate?: (path: string) => void; collapsed?: boolean
- Where reused: AppShell, Admin layout

4) Breadcrumbs
- Purpose: Contextual breadcrumbs for deep pages (project → milestone → dispute).
- Props: items: { label: string; href?: string }[]
- Where reused: Project Details, Dispute pages, Admin pages

---

## Typography & small UI primitives

5) Button (styled wrapper)
- Purpose: Primary action button consistent with design system.
- Props: variant?: 'primary'|'secondary'|'ghost'|'danger'; size?: 'sm'|'md'|'lg'; onClick?: () => void; disabled?: boolean; leftIcon?: ReactNode; rightIcon?: ReactNode
- Where reused: All pages (form submit, fund, approve/reject)

6) IconButton
- Purpose: Compact icon-only action (notifications, close, edit).
- Props: icon: ReactNode; size?: 'sm'|'md'|'lg'; onClick?: () => void; title?: string
- Where reused: Topbar, Cards, Lists

7) Badge
- Purpose: Small status indicator (funded, pending, dispute).
- Props: label: string; tone?: 'neutral'|'success'|'warning'|'error'; size?: 'sm'|'md'
- Where reused: Milestone cards, Project headers, Lists

8) Tag / Pill
- Purpose: Display tags, skills, categories.
- Props: label: string; removable?: boolean; onRemove?: () => void; tone?: string
- Where reused: Project metadata, search filters, profile skills

9) Avatar
- Purpose: User avatar with fallback initials and presence indicator.
- Props: src?: string; name?: string; size?: 'sm'|'md'|'lg'; status?: 'online'|'offline'|'busy'
- Where reused: Topbar profile, chat, user lists, admin user view

10) EmptyState
- Purpose: Informative empty state with CTA.
- Props: title: string; description?: string; primaryAction?: { label: string; onClick: () => void }; secondaryAction?: ...
- Where reused: No-results search, empty inbox, no disputes

---

## Forms & inputs

11) Input (text)
- Purpose: Standard text input with label, hint and validation states.
- Props: name: string; label?: string; value?: string; onChange?: (v:string)=>void; placeholder?: string; error?: string; type?: 'text'|'email'|'number'|'password'
- Where reused: Project forms, auth, billing forms

12) TextArea
- Purpose: Multiline input with optional markdown support.
- Props: name: string; label?: string; value?: string; onChange?: (v:string)=>void; placeholder?: string; rows?: number
- Where reused: Project description, dispute narrative, message composer

13) Select / Combobox
- Purpose: Single- or multi-select with search.
- Props: options: { label:string; value:string }[]; value?: string | string[]; onChange: (v)=>void; multi?: boolean; placeholder?: string
- Where reused: Filters, skill selectors, payment method selector

14) DatePicker
- Purpose: Pick dates (and optionally times) for milestones & deadlines.
- Props: value?: string; onChange: (iso:string)=>void; showTime?: boolean; minDate?: string
- Where reused: Milestone Creator, project deadlines

15) FileUploader
- Purpose: Drag-and-drop uploads with previews, progress, metadata fields.
- Props: onFilesAdded: (files: File[])=>void; accept?: string; maxSize?: number; multiple?: boolean; existingFiles?: FileMeta[]
- Where reused: Submit Work, Dispute evidence, Profile portfolio

16) Toggle / Switch
- Purpose: Binary switches for settings (auto-approve, public profile).
- Props: checked: boolean; onChange: (b:boolean)=>void; label?: string
- Where reused: Project settings, submission options

17) RadioGroup
- Purpose: Select one option from a small set (resolution preference).
- Props: options: {label:string; value:string}[]; value:string; onChange:(v)=>void
- Where reused: Dispute filing, payment method choices

18) Stepper / Wizard
- Purpose: Multi-step flows with previous/next handling.
- Props: steps: {id:string; title:string}[]; currentStepId: string; onStepChange?: (id:string)=>void
- Where reused: Create Project wizard, Dispute filing, Funding flow

---

## Data display components

19) MetricCard
- Purpose: Small KPI card with number, label and trend sparkline.
- Props: title: string; value: string|number; trend?: number; subLabel?: string
- Where reused: Dashboard overview, admin KPIs

20) ProjectCard
- Purpose: Compact card summarizing a project (title, status, milestones, actions).
- Props: project: ProjectSummary; onPrimary?: ()=>void; onSecondary?: ()=>void
- Where reused: Dashboard list, Marketplace, Search results

21) MilestoneCard
- Purpose: Display milestone info (amount, due date, funded status, CTA).
- Props: milestone: Milestone; onFund?: ()=>void; onSubmit?: ()=>void; onDispute?: ()=>void
- Where reused: Project Details, Milestone Creator, Escrow list

22) TransactionRow / TransactionList
- Purpose: Show transaction items with date, amount, status, tx id link.
- Props: transactions: Transaction[]; onViewTx?: (txid:string)=>void; paginate?: boolean
- Where reused: Wallet, Payments & Escrow, Admin ledger

23) Table (generic)
- Purpose: Flexible data table with sorting, selection, and actions.
- Props: columns: Column[]; data: any[]; selectable?: boolean; onSort?: ()=>void; onRowClick?: (r)=>void
- Where reused: Admin user lists, proposals list, disputes list

24) AvatarList / UserListItem
- Purpose: Compact user entry with avatar, name, role, rating.
- Props: user: UserSummary; onClick?: ()=>void; showAction?: boolean
- Where reused: Proposals, team/invite UI, admin user management

25) Timeline / ActivityFeed
- Purpose: Chronological list of events with icons and attachments.
- Props: items: {time:string; title:string; body?:string; attachments?: any[]}[]; compact?: boolean
- Where reused: Project activity, dispute timeline, dashboard feed

26) Chat / Conversation UI
- Purpose: Real-time threaded messaging component with attachments and linking to milestones.
- Props: messages: Message[]; onSend: (msg)=>void; onUpload: (files)=>void; participants: UserSummary[]
- Where reused: Project pages, dispute discussions, support

---

## Modals, sheets & overlays

27) Modal
- Purpose: Generic modal wrapper (title, content, actions).
- Props: isOpen: boolean; title?: string; onClose: ()=>void; footer?: ReactNode
- Where reused: Confirmations, forms (funding confirmation, delete milestone)

28) SlideOver / Drawer
- Purpose: Right-side panel for details without leaving the page.
- Props: isOpen:boolean; title?:string; onClose:()=>void; size?: 'sm'|'md'|'lg'
- Where reused: Quick preview of submission, dispute detail, admin case viewer

29) ConfirmationDialog
- Purpose: Standardized confirm/cancel pattern for destructive or irreversible actions.
- Props: message: string; onConfirm: ()=>void; onCancel?: ()=>void; confirmLabel?: string; danger?: boolean
- Where reused: Release funds, refund, delete milestone, ban user

---

## Notifications & feedback

30) Toast / Notification
- Purpose: Transient feedback messages (success/error/info).
- Props: message: string; tone?: 'success'|'error'|'info'|'warning'; duration?: number; action?: {label:string; onClick:()=>void}
- Where reused: All pages for async actions

31) InlineAlert
- Purpose: Contextual inline messages with optional CTA.
- Props: title?: string; description?: string; tone?: 'info'|'warning'|'error'|'success'
- Where reused: Form validation, funding failures, dispute warnings

---

## Search & filtering

32) SearchBar with Autosuggest
- Purpose: Global or local search with autosuggest results.
- Props: placeholder?: string; onSearch: (q:string)=>void; suggestions?: Suggestion[]; onSelectSuggestion?: (s)=>void
- Where reused: Topbar search, Marketplace, User search

33) FiltersPanel
- Purpose: Multi-faceted filters (skills, rating, price, location, tags).
- Props: filters: FilterSpec[]; onChange: (newFilters)=>void; collapsed?: boolean
- Where reused: Marketplace, Admin lists, Disputes search

---

## Dispute & AI-specific components

34) EvidenceCard
- Purpose: Display an evidence item (file, chat snippet, tx) with metadata and relevance score.
- Props: evidence: Evidence; relevance?: number; onDownload?: ()=>void; onFlag?: ()=>void
- Where reused: Dispute Detail, AI summary, Admin review

35) DisputeSummaryCard
- Purpose: Compact dispute overview with status, parties, amount, and quick actions.
- Props: dispute: DisputeSummary; onView?: ()=>void; onEscalate?: ()=>void
- Where reused: Dispute Center, Admin queue

36) AISummaryPane
- Purpose: Render AI analysis: summary, confidence, extracted facts, recommended outcomes.
- Props: aiResult: {summary:string; confidence:number; facts:string[]; recommendations: {label:string;score:number}[]}; onAccept?: ()=>void; onRequestHuman?: ()=>void
- Where reused: AI Dispute Summary page, Dispute detail, Admin view

37) EvidenceUploader (structured)
- Purpose: Guided evidence capture with typed fields (chat link, tx id, files).
- Props: onAddEvidence: (Evidence)=>void; requiredTypes?: string[]; maxFiles?: number
- Where reused: Dispute Filing, Admin follow-up

---

## Payments & wallet

38) WalletConnectButton
- Purpose: Initiate wallet connection flow and show current wallet status.
- Props: connectedAddress?: string; onConnect?: ()=>void; onDisconnect?: ()=>void; balance?: string
- Where reused: Topbar, Escrow Funding, Payouts

39) PaymentMethodSelector
- Purpose: Select and configure payment method (card, bank, on‑chain).
- Props: methods: PaymentMethod[]; selected?: string; onSelect: (id)=>void
- Where reused: Escrow Funding page, Billing

40) ConfirmTransactionPanel
- Purpose: Show tx summary, fees, and sign/confirm controls for blockchain or fiat transactions.
- Props: amount:number; fees:number; method:string; onConfirm:()=>void; onCancel:()=>void; txPreview?: TxPreview
- Where reused: Escrow Funding, Admin manual payouts

---

## Admin & monitoring

41) AdminTableRow (with actions)
- Purpose: Table row specialized for admin actions (suspend, adjust balance, view history).
- Props: entity: any; actions: {label:string; onClick:()=>void}[]; auditLink?: string
- Where reused: Admin user list, escrow reconciliation

42) AuditTrailViewer
- Purpose: Show chronological admin actions and system events with filters.
- Props: events: AuditEvent[]; onExport?: ()=>void; filters?: any
- Where reused: Admin dispute panel, Compliance pages

43) RiskScoreBadge
- Purpose: Compact component showing fraud/risk score with tooltip explanation.
- Props: score:number; onDetails?: ()=>void
- Where reused: Admin queue, user profile cards, dispute list

---

## Utilities & misc

44) Spinner / LoadingOverlay
- Purpose: Indicate in-progress actions with optional blocking overlay.
- Props: size?: 'sm'|'md'|'lg'; message?: string; fullscreen?: boolean
- Where reused: All async flows, compile actions, funding progress

45) Pagination
- Purpose: Standardized page navigation for long lists.
- Props: page:number; totalPages:number; onPageChange:(p:number)=>void; perPage?:number
- Where reused: Marketplace, Admin lists, Disputes

46) CollapsiblePanel / Accordion
- Purpose: Expand/collapse content sections for long pages.
- Props: title:string; defaultOpen?: boolean; onToggle?: (open:boolean)=>void
- Where reused: AI explainability sections, policy docs, evidence lists

47) Tooltip
- Purpose: Small hover/tap hints for icons and labels.
- Props: content: string; position?: 'top'|'right'|'bottom'|'left'
- Where reused: Everywhere for microcopy, icons, confidence scores

48) Heatmap / MiniChart
- Purpose: Small sparkline or mini chart for trends in metric cards.
- Props: data:number[]; height?: number; color?: string
- Where reused: Dashboard metrics, Admin KPIs

---

## Design-system adapters & wrappers

49) ShadcnProvider (design tokens)
- Purpose: Wraps shadcn/ui components and provides theme tokens / Tailwind integration hooks.
- Props: children: ReactNode; theme?: ThemeConfig
- Where reused: App entry, Storybook, page _app

50) FormField (HOC)
- Purpose: Unified form field wrapper that renders label, validation and description consistently.
- Props: label?: string; hint?: string; error?: string; children: ReactNode
- Where reused: All forms (project creation, dispute filing, billing)


---

Notes
- These components are intentionally described at a functional level. Implement with shadcn/ui primitives where useful and apply Tailwind for layout and visual tokens.
- Add accessibility props (aria-*) and keyboard handlers to interactive components.
- When ready, I can generate TypeScript interface stubs for each component to include in a repository `components/` index.
