# eCommerce Platform — Full Flow Documentation

> **Project:** `e-commerce-project` (Next.js / Supabase)
> **Purpose:** End-to-end implementation guide covering landing page, auth flow, membership, payments, license key management, WordPress plugin integration, and dashboard analytics.
Start your eCommerce flow from the landing page, even though login and signup already exist in your project, you need to modify the behavior to strictly follow the required flow.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure Reference](#2-project-structure-reference)
3. [Landing Page](#3-landing-page)
4. [Authentication Flow](#4-authentication-flow)
   - 4.1 [Sign Up](#41-sign-up)
   - 4.2 [Login](#42-login)
5. [Membership Selection Page](#5-membership-selection-page)
6. [Payment Gateway Integration](#6-payment-gateway-integration)
7. [License Key Generation & Display](#7-license-key-generation--display)
8. [Post-Payment: Dashboard Redirect & Confirmation Email](#8-post-payment-dashboard-redirect--confirmation-email)
9. [WordPress Plugin](#9-wordpress-plugin)
   - 9.1 [Plugin Installation & License Activation](#91-plugin-installation--license-activation)
   - 9.2 [Backend License Validation API](#92-backend-license-validation-api)
   - 9.3 [Layout & Transition Selection](#93-layout--transition-selection)
   - 9.4 [Layout Data API](#94-layout-data-api)
10. [Database Schema](#10-database-schema)
11. [User Dashboard](#11-user-dashboard)
12. [Script-Based WordPress Integration](#12-script-based-wordpress-integration)
13. [Flow Summary Diagram](#13-flow-summary-diagram)
14. [Key Implementation Rules](#14-key-implementation-rules)

---

## 1. Project Overview

This document describes the complete eCommerce platform flow built on **Next.js** with **Supabase** as the backend. The platform manages user registration, tiered membership subscriptions, payment processing, license key issuance, and a companion WordPress plugin that communicates with the backend API to deliver dynamic layout content based on the user's subscription plan.

The entire solution is packaged as a **single deployable script** that integrates seamlessly into any WordPress environment without requiring super admin setup or manual configuration steps.

---

## 2. Project Structure Reference

The following is the existing project structure as visible in the codebase:

```
e-commerce-project/
├── .agents/
├── .next/
├── app/
│   ├── (auth)/
│   ├── (main)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── superadmin.tsx
│   │       └── user.tsx
│   ├── actions/
│   │   └── auth-actions.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  ← Root landing page (to be modified)
├── components/
│   ├── auth/
│   │   └── UserSignup.tsx        ← Existing signup component (to be modified)
│   ├── ui/
│   │   ├── alert.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── sonner.tsx
│   ├── error-state.tsx
│   └── loading-state.tsx
├── helper/
│   ├── domin-finder.ts
│   └── role-gateway.tsx
├── lib/
├── node_modules/
├── public/
├── supabase/
├── test/
├── types/
│   ├── database-type.ts
│   └── general-type.ts
├── .env.local
├── .gitignore
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
├── README.md
└── tsconfig.json
```

**New files/routes to be created:**

```
app/
├── page.tsx                        ← Modify: Landing Page
├── (auth)/
│   ├── signup/page.tsx             ← Modify: Registration Page
│   ├── login/page.tsx              ← Modify: Login Page
├── membership/page.tsx             ← New: Membership Selection
├── payment/page.tsx                ← New: Payment Page
├── license/page.tsx                ← New: License Key Display (one-time)
├── (main)/dashboard/
│   ├── page.tsx                    ← Modify: User Dashboard
│   └── user.tsx                    ← Modify: Dashboard UI
├── api/
│   ├── validate-license/route.ts   ← New: License Validation API
│   └── layout-data/route.ts        ← New: Layout Data API
```

---

## 3. Landing Page

### Location
`app/page.tsx`

### Behavior

The platform **must begin** with a clean, modern landing page that:

- Clearly explains the product and its value proposition.
- Displays a **prominent primary call-to-action button**.
- Dynamically adjusts the CTA button based on the user's authentication state:

| User State | Button Displayed | Action |
|---|---|---|
| Not logged in / New user | **Sign Up** | Redirects to `/signup` |
| Already registered (returning user) | **Login** | Redirects to `/login` |

### Implementation Notes

- On page load, check for an active Supabase session (via `supabase.auth.getSession()`).
- If a session exists → render **Login** button.
- If no session → render **Sign Up** button.
- The landing page must **never** expose internal routing logic or script-copying processes to the end user.
- Use the existing `globals.css` and UI component library (`components/ui/`) to maintain consistent styling.

### Suggested Landing Page Sections

1. **Hero Section** — Headline, subheadline, and primary CTA button.
2. **Features Section** — Key benefits of the platform.
3. **Membership Plans Preview** — A brief overview of the three available plans (non-interactive teaser).
4. **Footer** — Links and branding.

---

## 4. Authentication Flow

### 4.1 Sign Up

**Route:** `/signup`  
**Component:** `components/auth/UserSignup.tsx` *(modify existing)*

#### Required Fields

| Field | Type | Validation |
|---|---|---|
| Full Name | Text | Required, min 2 characters |
| Email | Email | Required, valid email format |
| Password | Password | Required, min 8 characters |

#### Flow

```
User clicks "Sign Up" on Landing Page
        ↓
Redirected to /signup
        ↓
User fills in Name, Email, Password
        ↓
Form submitted → auth-actions.ts → Supabase Auth (signUp)
        ↓
Registration successful
        ↓
AUTO-REDIRECT → /membership  (no delay)
```

#### Key Rules

- After successful registration, **automatically redirect** to `/membership` without any intermediate confirmation screen or delay.
- Store the user's `name` in the Supabase `profiles` table or user metadata for later use.
- Use `app/actions/auth-actions.ts` for the server-side signup action.

---

### 4.2 Login

**Route:** `/login`

#### Flow

```
User clicks "Login" on Landing Page
        ↓
Redirected to /login
        ↓
User enters Email and Password
        ↓
Supabase Auth (signInWithPassword)
        ↓
Check user progress in DB
        ┌──────────────────────────────────────────┐
        │  Has user selected a membership plan?    │
        │  NO  → Redirect to /membership           │
        │  YES → Redirect to /dashboard            │
        └──────────────────────────────────────────┘
```

#### Key Rules

- After login, **always check the user's progress** before deciding where to redirect.
- The progress check must query the database to determine whether the user has a completed membership selection and successful payment.
- Use `helper/role-gateway.tsx` as the gating mechanism to enforce redirects.

---

## 5. Membership Selection Page

**Route:** `/membership`

### Plan Display Requirements

Three clearly defined plans must be displayed. Suggested default structure (customize as needed):

| Plan | Features | Price |
|---|---|---|
| **Basic** | Layout 1 only, Standard transitions, Limited API calls | $X/month |
| **Pro** | Layouts 1–3, Advanced transitions, More API calls | $Y/month |
| **Enterprise** | All Layouts (1–4), All transitions, Unlimited API calls | $Z/month |

### Behavior

- The user **must select one plan** before being allowed to proceed.
- The **"Proceed to Payment"** button must be **disabled/blocked** until a plan is selected.
- The system must strictly block direct navigation to `/payment` unless a plan has been selected (enforce via session/cookie state or server-side check).
- Once a plan is selected and the user clicks "Proceed to Payment," save the selected plan to the user's session/database record and redirect to `/payment`.

### Access Control

- Only authenticated users can access this page.
- Unauthenticated users attempting to visit `/membership` must be redirected to `/login`.

---

## 6. Payment Gateway Integration

**Route:** `/payment`

### Requirements

- A payment gateway must be integrated and properly **configured with your domain**.
- The payment page must display the selected membership plan and its pricing before the user confirms payment.
- Implement Stripe (recommended) or another gateway with:
  - Secure payment form.
  - Domain-verified webhook for payment confirmation.
  - Success and failure handling.

### Access Control

- Access to `/payment` is **strictly blocked** unless a membership plan has been selected.
- Enforce this with a server-side redirect: if no plan is found in the user's session/database record, redirect back to `/membership`.

### Payment Flow

```
User arrives at /payment with selected plan
        ↓
Payment form displayed (amount, plan name, card details)
        ↓
User submits payment
        ↓
Payment gateway processes transaction
        ↓
On SUCCESS:
  → Update DB: payment_status = 'completed'
  → Generate unique license key
  → Store license key in DB (never display again after first view)
  → Redirect to /license (one-time display page)
On FAILURE:
  → Show error message
  → Allow retry
```

---

## 7. License Key Generation & Display

**Route:** `/license`

### License Key Generation Rules

- Generated **instantly** upon successful payment.
- Must be **cryptographically unique** (use UUID v4 or similar).
- Stored in the database immediately.
- **Displayed only once** on the `/license` page.
- After the user navigates away from `/license`, the key must **never be shown again** in any part of the UI.

### Page Content Requirements

The `/license` page must display:

1. A success message confirming the payment.
2. The full license key in a clearly visible, copyable format (e.g., a code block with a "Copy" button).
3. A prominent warning instructing the user to **copy and save the key securely**, as it will not be shown again.
4. A "Go to Dashboard" button that redirects to `/dashboard`.

### Security Rules

- Mark the license as "displayed" in the database immediately upon rendering the `/license` page.
- On any subsequent access to `/license`, redirect the user to `/dashboard` instead of showing the key again.
- The `/license` route must be protected: only the authenticated user who just completed payment may access it.

---

## 8. Post-Payment: Dashboard Redirect & Confirmation Email

### Dashboard Redirect

After the user clicks "Go to Dashboard" on the `/license` page:

- Redirect to `/dashboard`.
- The dashboard reflects the user's active membership, plan details, and usage analytics.

### Confirmation Email

**Triggered simultaneously** upon successful payment (via webhook or server action). The email must contain:

1. Payment confirmation details (plan name, amount paid, date).
2. A downloadable link to the **WordPress Plugin ZIP file**.
3. Instructions for installing and activating the plugin using the license key.

> **Note:** The license key itself should **not** be included in the email for security. The user must have copied it from the one-time display page.

---

## 9. WordPress Plugin

### 9.1 Plugin Installation & License Activation

When the user installs the WordPress plugin (received via the confirmation email), the plugin must:

1. Display a settings/activation screen prompting the user to **enter their license key**.
2. On submission, send an **API request to the backend** with the following payload:

```json
{
  "license_key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "domain": "https://user-wordpress-site.com"
}
```

3. Display the result based on the API response:
   - **Valid:** Show a welcome message with the user's name and the remaining validity period.
   - **Invalid:** Show an error message explaining the reason (key not found, payment incomplete, domain mismatch).

---

### 9.2 Backend License Validation API

**Route:** `POST /api/validate-license`

#### Request Payload

```json
{
  "license_key": "string",
  "domain": "string"
}
```

#### Validation Logic

The API must perform all three of the following checks:

| Check | Condition | Failure Response |
|---|---|---|
| License Exists | `license_key` found in DB | `false` |
| Payment Completed | `payment_status === 'completed'` | `false` |
| Domain Match | `domain` matches stored domain | `false` |

#### Response

**Valid license:**
```json
{
  "valid": true,
  "user_name": "John Doe",
  "validity_remaining_days": 28,
  "plan": "pro"
}
```

**Invalid license:**
```json
{
  "valid": false,
  "reason": "Domain mismatch"
}
```

---

### 9.3 Layout & Transition Selection

After successful license validation, the plugin displays available **layouts** and **transitions** based on the user's subscribed plan:

| Plan | Available Layouts | Available Transitions |
|---|---|---|
| Basic | Layout 1 | Standard |
| Pro | Layout 1, 2, 3 | Standard, Advanced |
| Enterprise | Layout 1, 2, 3, 4 | All Transitions |

The user selects a layout (e.g., Layout 1, 2, 3, or 4) from within the WordPress plugin interface.

---

### 9.4 Layout Data API

When a layout is selected, the plugin sends an API request to fetch the corresponding layout data.

**Route:** `POST /api/layout-data`

#### Request Payload

```json
{
  "license_key": "string",
  "layout_id": "layout_1"
}
```

#### Backend Behavior

- Validate the license key before returning any layout data.
- Fetch the requested layout from the centralized layout management system.
- Convert existing **PHP-based layouts** into **Next.js-compatible structures**.
- Deliver the layout data dynamically in the API response.

#### Response

```json
{
  "layout_id": "layout_1",
  "name": "Layout 1",
  "structure": {
    "type": "nextjs_compatible",
    "components": [ ... ],
    "styles": { ... },
    "transitions": { ... }
  }
}
```

---

## 10. Database Schema

The backend database must manage all license-related data. The following fields are required in the `licenses` table:

| Field | Type | Description |
|---|---|---|
| `id` | Integer / Serial | Auto-incrementing primary key |
| `uuid` | UUID | Universally unique identifier |
| `license_key` | VARCHAR (unique) | The generated license key |
| `status` | ENUM / VARCHAR | `active`, `inactive`, `expired` |
| `version` | VARCHAR | Plugin/platform version associated |
| `validity_period` | INTEGER | Validity duration in days |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `payment_status` | ENUM / VARCHAR | `pending`, `completed`, `failed` |
| `domain` | VARCHAR | WordPress domain registered with the license |
| `user_id` | UUID / FK | Foreign key referencing the `users` / `profiles` table |
| `plan` | VARCHAR | `basic`, `pro`, `enterprise` |
| `displayed_once` | BOOLEAN | Whether license key has been shown to the user |

### Additional Tables

**`profiles`** — Extended user data:

| Field | Type | Description |
|---|---|---|
| `id` | UUID (FK) | References `auth.users.id` in Supabase |
| `name` | VARCHAR | User's full name |
| `email` | VARCHAR | User's email |
| `membership_selected` | BOOLEAN | Whether a plan has been selected |
| `plan` | VARCHAR | Selected membership plan |

**`api_usage`** — Tracks API call analytics:

| Field | Type | Description |
|---|---|---|
| `id` | Serial | Primary key |
| `user_id` | UUID (FK) | References `profiles.id` |
| `endpoint` | VARCHAR | API endpoint called |
| `called_at` | TIMESTAMP | Timestamp of the API call |

---

## 11. User Dashboard

**Route:** `/dashboard`

### Access Control

- Only authenticated users with a **completed payment** may access the dashboard.
- Users without a completed plan are redirected to `/membership`.

### Dashboard Sections

#### 1. Overview / Welcome

- Personalized greeting using the user's name.
- Current active plan and its status.
- License validity countdown (days remaining).

#### 2. Analytics

The dashboard must display the following analytics:

| Metric | Description |
|---|---|
| **API Usage Count** | Total number of API requests made by the plugin |
| **Number of Data Fetches** | Total number of layout data fetch requests |
| **Membership Validity** | Expiry date and remaining days |

#### 3. Plan Management

- Display the current plan.
- Provide a clear **"Upgrade Plan"** button that redirects the user back to `/membership` to select a higher-tier plan.

#### 4. Centralized Layout Management

- The dashboard serves as the management hub for **prebuilt layouts**.
- Layouts are assigned and delivered dynamically based on the user's subscription plan.
- Admin/superadmin (`superadmin.tsx`) can manage which layouts are available per plan.

---

## 12. Script-Based WordPress Integration

### Requirements

The entire eCommerce platform must be packageable as a **single deployable script** that:

- Integrates into WordPress **without requiring super admin setup or manual configuration**.
- Handles all **routing, UI rendering, and flow logic internally**.
- Becomes immediately visible and functional once integrated into the WordPress site.
- Does **not expose or demonstrate** the internal script copying or integration process to the end user.

### Implementation Approach

1. **Build Output:** After running `next build`, the Next.js application produces a standalone/static output.
2. **Single Script Package:** Bundle the eCommerce application into a self-contained script (e.g., using `next export` or a custom webpack bundle) that can be served from WordPress.
3. **WordPress Integration Options:**
   - **Shortcode-based:** Provide a shortcode (e.g., `[ecommerce_platform]`) that the WordPress team places in any page; the script auto-initializes and renders the full flow.
   - **Auto-init Script:** A JavaScript file that detects the target DOM element and bootstraps the entire eCommerce application.
4. **No Additional Setup:** Once the script/plugin is placed in the WordPress environment, the eCommerce interface loads automatically.
5. **Seamless UX:** The user sees only a polished, ready-to-use eCommerce interface — no internal scaffolding, no script injection visible.

### Deployment Steps for WordPress Team

The WordPress team only needs to:

```
1. Receive the single deployable script/plugin file.
2. Upload and activate the script/plugin in WordPress.
3. Place the provided shortcode on the desired page (if shortcode-based).
4. The eCommerce platform is live — no further setup required.
```

---

## 13. Flow Summary Diagram

```
[Landing Page]
      │
      ├─── New User ──→ [Sign Up Page] ──→ [Membership Selection] ──→ [Payment Page]
      │                                                                       │
      │                                                               Payment Success
      │                                                                       │
      │                                                            [License Key Display]
      │                                                            (shown ONCE only)
      │                                                                       │
      │                                                               [Dashboard]
      │
      └─── Returning User ──→ [Login Page]
                                    │
                          ┌─────────┴──────────┐
                          │                    │
                   No Plan Selected     Plan Already Selected
                          │                    │
                  [Membership Page]      [Dashboard]


[WordPress Plugin]
      │
      ├─── Enter License Key
      │         │
      │    POST /api/validate-license
      │         │
      │    ┌────┴────┐
      │  Valid    Invalid
      │    │          │
      │  Welcome    Error
      │  Message   Message
      │    │
      │  Select Layout / Transition
      │         │
      │    POST /api/layout-data
      │         │
      │  Render Layout on WordPress Site
```

---

## 14. Key Implementation Rules

The following rules must be strictly followed throughout the implementation:

1. **Landing Page is the entry point.** The flow always begins at the landing page — login and signup pages are not directly accessible as primary entry points.

2. **Dynamic CTA button.** The landing page button dynamically switches between "Sign Up" (unauthenticated) and "Login" (authenticated) based on session state.

3. **Auto-redirect after signup.** On successful registration, redirect immediately to `/membership` with no delay or confirmation screen.

4. **Login redirects based on progress.** Post-login routing checks user progress: no plan → `/membership`; plan completed → `/dashboard`.

5. **Membership is mandatory before payment.** The `/payment` page is strictly inaccessible without a selected plan. Enforce both client-side and server-side.

6. **License key shown only once.** The license key is generated on payment success and displayed exactly once. After the user navigates away, it is never shown again in the UI.

7. **Confirmation email is automatic.** Sent simultaneously with the dashboard redirect, containing payment details and the WordPress plugin ZIP file.

8. **Three-check license validation.** The API validates: (a) key exists, (b) payment completed, (c) domain matches. All three must pass for a `true` response.

9. **Layout access is plan-based.** The plugin only shows layouts and transitions permitted by the user's active subscription plan.

10. **PHP layouts converted to Next.js.** All existing PHP-based layouts must be converted into Next.js-compatible structures before delivery via the layout data API.

11. **Single deployable script.** The entire eCommerce solution must be packageable as a single script for WordPress integration — no super admin setup, no manual configuration.

12. **No internal exposure.** The script integration process must never be visible or exposed to the end user. The interface must appear seamless and ready-to-use immediately upon integration.

13. **Dashboard analytics.** The user dashboard must track and display API usage count, data fetch count, membership validity, and plan upgrade options.

14. **Centralized layout management.** The backend maintains a centralized system for managing and assigning prebuilt layouts dynamically based on the user's subscription tier.

---

*End of Documentation*