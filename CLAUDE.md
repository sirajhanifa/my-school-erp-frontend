# MySchool ERP — Frontend

React 19 + Vite 8 + TypeScript SPA for the school ERP. Tailwind CSS v4, React Router v7, Zustand, React Hook Form + Zod, axios, lucide-react. The API lives in `../my-school-erp-backend`.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (this is the type-check)
- `npm run lint` — ESLint
- There are no tests.

## Talking to the backend

- Use the shared axios instance `src/components/axios/axios.ts` — never create another. `baseURL` is `VITE_API_BASE_URL` (`/api`), `withCredentials: true`.
- In dev, Vite proxies `/api` to `http://localhost:9000` (`vite.config.ts`), so the browser sees one origin and the httpOnly auth cookie works. Keep API calls relative (`api.get("/auth/me")`), not absolute URLs.
- Auth is cookie-based; the frontend never sees or stores the JWT. Don't put tokens in localStorage.
- Backend errors come back as `{ message }`; show `error.response?.data?.message` with a fallback.

## Layout

```
src/
  App.tsx              routes (BrowserRouter); calls checkAuth() on load
  modules/<area>/...   pages, grouped by feature (auth/login/LoginPage.tsx, dashboard/DashboardPage.tsx)
  components/
    form/              shared form kit (see below)
    toast/Toaster.tsx  renders toasts from toastStore
    icon/Icon.tsx      <Icon name="User" /> — any lucide-react icon by name
    ProtectedRoute.tsx wrap pages that need login
  store/               Zustand stores (authStore, toastStore, moduleStore, classStore)
  schemas/             Zod schemas + inferred form types
  utils/
```

## Conventions

- **Pages**: add under `src/modules/<feature>/`, register in `App.tsx`, wrap in `<ProtectedRoute>` unless public.
- **Forms**: React Hook Form with `zodResolver(schema)`. Put the schema in `src/schemas/<name>Schema.ts` and export `type XFormValues = z.infer<typeof xSchema>`. Validation rules live in the Zod schema; the `required` prop on form components only shows the `*` marker.
- **Use the form kit** in `components/form/` instead of raw inputs: `FormContainer`, `FormSection`, `FormInput`, `FormSelect`, `FormAutocomplete`, `FormCheckbox`, `FormDatePicker`, `FormTextarea`, `FormActions`, `Spinner`. Shared input styling is in `formStyles.ts` — change the look there, not per component. Components are generic over the form type and take `register` + `error`.
- **Lists**: use `components/list/List.tsx` for list pages — pass `items`, `columns` (`{ header, render, className? }`), `getKey` and `getSearchText`. Search and pagination run in the browser on the loaded items.
- **Toasts**: `import { toast } from ".../store/toastStore"` (relative path; there is no `src` alias) → `toast.success(...)`, `toast.error(...)`. Works outside React too.
- **State**: Zustand stores with `create<State>()((set) => ({ ... }))`; select single fields: `useAuthStore((s) => s.user)`.
- **API calls live in stores, not in page components** (see `classStore`): the store calls the API, updates its state, shows the toast, and returns `true`/`false` so the page can react (e.g. clear its form).
- **Router**: import from `"react-router"` (v7), not `react-router-dom`.
- Styling is Tailwind utility classes with the slate palette and blue accents; no CSS modules or component library.
- Local imports have no file extension (bundler resolution). Components are default-exported arrow functions (form-kit components are generic `function`s).
- Comments are plain-English and explain *why* (the codebase is written to be readable by learners). Keep that style.
- Keep comments simple and clear: one or two lines maximum. Avoid long explanations in comments.
- Dates as `YYYY-MM-DD` in local time: use `utils/date.ts`, not `toISOString()` (it shifts to UTC).

## Auth flow

`authStore` holds `user` (`{ id, name, email, role }` — `role` is the role name string), `isAuthenticated`, `isCheckingAuth`. `checkAuth()` calls `GET /auth/me` on app load; `ProtectedRoute` shows a spinner while checking, then redirects to `/login` if not authenticated. `login()` returns `true`/`false` and sets `error`.
