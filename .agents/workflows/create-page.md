---
description: Use this to generate a new route with consistent folder structure.
---

# Workflow: Create Project Folder & File Structure

## Steps

1. Inside the `app` root folder, create route group folders using parentheses for grouping, such as `app/(auth)` and `app/(main)`.

2. Inside `app/(auth)`, create sub-route folders for each credential route, for example `app/(auth)/login` and `app/(auth)/signup`.

3. Inside `app/(main)`, create sub-route folders for each page route, for example `app/(main)/dashboard` and `app/(main)/settings`.

4. Inside each `app/(auth)` route folder like `app/(auth)/login`, add the following files: `page.tsx` as the main route entry, `superadmin.tsx` for the Super Admin role view, and `user.tsx` for the User role view.

5. Inside each `app/(main)` route folder like `app/(main)/dashboard`, add the following files: `page.tsx` as the main route entry, `superadmin.tsx` for the Super Admin role view, and `user.tsx` for the User role view.

6. Inside the `app` folder, create an `actions` sub-folder at `app/actions` for server action files.

7. Inside the `app` folder, create a `components` sub-folder at `app/components` for shared UI components used across the project.

8. At the project root level, create a `helper` folder, then add `role-gateway.tsx` inside it.

9. **Generate Page**: Create `page.tsx` as an `async` Server Component, import `RoleGateway` from `@/helper/role-gateway`, and import the role views created in Step 4 and Step 5 from the local directory.

10. **Implementation**: In `page.tsx`, return the `<RoleGateway />` component and map the imported components to the `superadmin` and `user` props.

11. **Loading State**: Wrap the `RoleGateway` in a `Suspense` boundary using your `LoadingState` component.

12. At the project root level, create a `lib` folder, then create a `supabase` sub-folder inside it. Inside `lib/supabase`, add the following files: `client.ts`, `server.ts`, `proxy.ts`, and `index.ts`.

13. At the project root level, create a `types` folder, then add `database-type.ts` and `general-type.ts` inside it.