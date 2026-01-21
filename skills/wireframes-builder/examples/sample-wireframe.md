# Example: Wireframe Output

## Input

User request: "Create a wireframe for a user dashboard with stats cards and recent activity"

## Generated Files

### File 1: `documentation/wireframes/dashboard.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Wireframe</title>
    <style>
        :root {
            --color-primary: #2563eb;
            --color-primary-dark: #1d4ed8;
            --color-secondary: #64748b;
            --color-background: #f1f5f9;
            --color-surface: #ffffff;
            --color-text: #1e293b;
            --color-text-muted: #64748b;
            --color-border: #e2e8f0;
            --color-success: #16a34a;
            --color-warning: #d97706;
            --color-error: #dc2626;

            --font-sans: system-ui, -apple-system, sans-serif;
            --space-2: 8px;
            --space-3: 12px;
            --space-4: 16px;
            --space-6: 24px;
            --space-8: 32px;
            --touch-target: 48px;
            --border-radius: 8px;
        }

        *, *::before, *::after { box-sizing: border-box; }

        body {
            font-family: var(--font-sans);
            background: var(--color-background);
            color: var(--color-text);
            margin: 0;
            line-height: 1.5;
        }

        .skip-link {
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--color-primary);
            color: white;
            padding: 8px 16px;
            z-index: 100;
        }
        .skip-link:focus { top: 0; }

        .dashboard {
            display: grid;
            grid-template-columns: 250px 1fr;
            min-height: 100vh;
        }

        @media (max-width: 768px) {
            .dashboard {
                grid-template-columns: 1fr;
            }
            .sidebar { display: none; }
        }

        /* Sidebar */
        .sidebar {
            background: var(--color-surface);
            border-right: 1px solid var(--color-border);
            padding: var(--space-4);
        }

        .sidebar-logo {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--color-primary);
            padding: var(--space-4);
            margin-bottom: var(--space-4);
        }

        .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .sidebar-nav a {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            padding: var(--space-3) var(--space-4);
            color: var(--color-text);
            text-decoration: none;
            border-radius: var(--border-radius);
            min-height: var(--touch-target);
        }

        .sidebar-nav a:hover,
        .sidebar-nav a:focus {
            background: var(--color-background);
        }

        .sidebar-nav a[aria-current="page"] {
            background: var(--color-primary);
            color: white;
        }

        /* Main Content */
        .main-content {
            padding: var(--space-6);
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-6);
        }

        .page-header h1 {
            margin: 0;
            font-size: 1.5rem;
        }

        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-4);
            margin-bottom: var(--space-6);
        }

        .stat-card {
            background: var(--color-surface);
            border-radius: var(--border-radius);
            padding: var(--space-4);
            border: 1px solid var(--color-border);
        }

        .stat-card-label {
            font-size: 0.875rem;
            color: var(--color-text-muted);
            margin-bottom: var(--space-2);
        }

        .stat-card-value {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: var(--space-2);
        }

        .stat-card-trend {
            font-size: 0.875rem;
        }

        .trend-up { color: var(--color-success); }
        .trend-down { color: var(--color-error); }

        /* Activity Feed */
        .activity-section {
            background: var(--color-surface);
            border-radius: var(--border-radius);
            border: 1px solid var(--color-border);
        }

        .activity-header {
            padding: var(--space-4);
            border-bottom: 1px solid var(--color-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .activity-header h2 {
            margin: 0;
            font-size: 1.125rem;
        }

        .activity-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .activity-item {
            padding: var(--space-4);
            border-bottom: 1px solid var(--color-border);
            display: flex;
            gap: var(--space-3);
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--color-background);
            flex-shrink: 0;
        }

        .activity-content {
            flex: 1;
        }

        .activity-title {
            font-weight: 500;
            margin-bottom: var(--space-1);
        }

        .activity-meta {
            font-size: 0.875rem;
            color: var(--color-text-muted);
        }

        /* Button */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: var(--touch-target);
            padding: var(--space-2) var(--space-4);
            border-radius: var(--border-radius);
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            border: none;
            background: var(--color-primary);
            color: white;
        }

        .btn:hover { background: var(--color-primary-dark); }
        .btn:focus { outline: 2px solid var(--color-primary); outline-offset: 2px; }

        .btn-secondary {
            background: white;
            border: 1px solid var(--color-border);
            color: var(--color-text);
        }

        /* Wireframe Note */
        .wireframe-note {
            background: #fef3c7;
            border: 1px dashed #f59e0b;
            border-radius: var(--border-radius);
            padding: var(--space-2) var(--space-3);
            font-size: 0.75rem;
            color: #92400e;
            margin-bottom: var(--space-4);
        }
    </style>
</head>
<body>
    <a href="#main" class="skip-link">Skip to main content</a>

    <div class="dashboard">
        <aside class="sidebar">
            <div class="sidebar-logo">AppName</div>
            <nav class="sidebar-nav" aria-label="Main navigation">
                <ul role="list">
                    <li><a href="#" aria-current="page">Dashboard</a></li>
                    <li><a href="#">Analytics</a></li>
                    <li><a href="#">Users</a></li>
                    <li><a href="#">Settings</a></li>
                </ul>
            </nav>
        </aside>

        <main id="main" class="main-content">
            <header class="page-header">
                <h1>Dashboard</h1>
                <button class="btn">New Report</button>
            </header>

            <div class="wireframe-note">
                Wireframe: Dashboard with stats cards and activity feed
            </div>

            <section aria-labelledby="stats-heading">
                <h2 id="stats-heading" class="sr-only">Statistics Overview</h2>
                <div class="stats-grid">
                    <article class="stat-card">
                        <div class="stat-card-label">Total Users</div>
                        <div class="stat-card-value">12,847</div>
                        <div class="stat-card-trend trend-up">+12% from last month</div>
                    </article>
                    <article class="stat-card">
                        <div class="stat-card-label">Revenue</div>
                        <div class="stat-card-value">$48,392</div>
                        <div class="stat-card-trend trend-up">+8% from last month</div>
                    </article>
                    <article class="stat-card">
                        <div class="stat-card-label">Active Sessions</div>
                        <div class="stat-card-value">1,284</div>
                        <div class="stat-card-trend trend-down">-3% from last month</div>
                    </article>
                    <article class="stat-card">
                        <div class="stat-card-label">Conversion Rate</div>
                        <div class="stat-card-value">3.2%</div>
                        <div class="stat-card-trend trend-up">+0.4% from last month</div>
                    </article>
                </div>
            </section>

            <section class="activity-section" aria-labelledby="activity-heading">
                <header class="activity-header">
                    <h2 id="activity-heading">Recent Activity</h2>
                    <a href="#" class="btn btn-secondary">View All</a>
                </header>
                <ul class="activity-list" role="list">
                    <li class="activity-item">
                        <div class="activity-avatar" aria-hidden="true"></div>
                        <div class="activity-content">
                            <div class="activity-title">New user signed up</div>
                            <div class="activity-meta">john@example.com - 5 minutes ago</div>
                        </div>
                    </li>
                    <li class="activity-item">
                        <div class="activity-avatar" aria-hidden="true"></div>
                        <div class="activity-content">
                            <div class="activity-title">Payment received</div>
                            <div class="activity-meta">Order #1234 - $299.00 - 12 minutes ago</div>
                        </div>
                    </li>
                    <li class="activity-item">
                        <div class="activity-avatar" aria-hidden="true"></div>
                        <div class="activity-content">
                            <div class="activity-title">Support ticket resolved</div>
                            <div class="activity-meta">Ticket #567 - 1 hour ago</div>
                        </div>
                    </li>
                </ul>
            </section>
        </main>
    </div>
</body>
</html>
```

### File 2: `documentation/wireframes/dashboard.md`

```markdown
# Dashboard Wireframe

**Created**: 2026-01-21
**Author**: Claude Code
**Status**: Draft

---

## Purpose

Main dashboard view for logged-in users showing key metrics, recent activity, and quick actions.

---

## User Stories

- As a **user**, I want to **see key metrics at a glance** so that **I understand system status quickly**
- As a **user**, I want to **view recent activity** so that **I stay informed about important events**
- As a **user**, I want to **navigate to other sections** so that **I can access detailed reports**

---

## Key Elements

| Element | Description | Priority |
|---------|-------------|----------|
| Stats Cards | 4 cards showing key metrics with trends | High |
| Activity Feed | List of recent events with timestamps | High |
| Sidebar Navigation | Main app navigation | High |
| New Report Button | CTA for creating reports | Medium |

---

## Page Structure

```
┌────────────────────────────────────┐
│ Sidebar │        Main Content      │
│         │ ┌──────────────────────┐ │
│ Logo    │ │ Header + CTA Button  │ │
│ ─────── │ └──────────────────────┘ │
│ Nav     │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│ - Dash  │ │   │ │   │ │   │ │   │ │
│ - Stats │ │   │ │   │ │   │ │   │ │
│ - Users │ └───┘ └───┘ └───┘ └───┘ │
│ - Settings │ ┌──────────────────┐ │
│         │ │   Activity Feed    │ │
│         │ │   - Item 1         │ │
│         │ │   - Item 2         │ │
│         │ │   - Item 3         │ │
│         │ └──────────────────────┘ │
└────────────────────────────────────┘
```

---

## Responsive Behavior

### Mobile (< 768px)
- Sidebar hidden, hamburger menu
- Stats cards stack vertically (1 column)
- Activity items full width

### Tablet (768px - 1024px)
- Sidebar collapsed (icons only)
- Stats cards 2x2 grid
- Activity feed full width

### Desktop (> 1024px)
- Full sidebar visible
- Stats cards 4 columns
- Full layout as wireframed

---

## Accessibility Notes

- [x] Semantic landmarks (main, aside, nav)
- [x] Heading hierarchy (h1 → h2)
- [x] Skip link to main content
- [x] ARIA current for active nav item
- [x] Touch targets >= 48px
- [x] Focus indicators visible

---

## Validation Status

- [ ] Reviewed with `/ux-standards-validator`
- [ ] Accessibility audit passed
- [ ] Mobile tested
- [ ] Stakeholder approved

---

*Generated by /wireframes-builder*
```

## Skill Output

```markdown
## Wireframe Generated

**File**: `documentation/wireframes/dashboard.html`
**Date**: 2026-01-21

### Structure
- Sidebar: Logo, navigation menu
- Main: Page header, stats grid (4 cards), activity feed

### Accessibility Features
- [x] Skip link to main content
- [x] Semantic landmarks (main, aside, nav)
- [x] ARIA current state for navigation
- [x] Heading hierarchy correct
- [x] Touch targets >= 48px

### Next Steps
1. Open `documentation/wireframes/dashboard.html` in browser
2. Run `/ux-standards-validator documentation/wireframes/dashboard.html`
3. Review and iterate based on feedback

### Preview
View at: `file:///path/to/documentation/wireframes/dashboard.html`
```
