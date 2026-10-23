/**
 * TEMPORARY ACCESS FLAG — remove once the backend is finished.
 *
 * Register and login don't work until the backend auth flow is done, so nobody
 * can authenticate into any workspace to test it. While this flag is `true`:
 * - <ProtectedRoute> lets every protected URL open directly by changing the
 *   address, so the team keeps full access until the integration lands.
 * - The blood-center pages treat the visitor as having full blood-center
 *   access (event posting + hospital approval).
 *
 * IMPORTANT:
 * - Set this back to `false` as soon as the backend auth flow is done: the
 *   normal auth/role checks in <ProtectedRoute> come back automatically.
 * - This only affects the frontend: every API call still requires a real
 *   backend session, so no backend data is exposed by this flag.
 */
export const TEMP_OPEN_ACCESS = true;

export default TEMP_OPEN_ACCESS;
