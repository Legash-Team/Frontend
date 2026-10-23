/**
 * TEMPORARY ACCESS FLAG — remove once the backend is finished.
 *
 * The backend for blood-center accounts (invite acceptance, bloodcenter login,
 * permission payloads) is not live yet, so nobody can authenticate into the
 * blood-center workspace to test it. While this flag is `true`, the
 * blood-center pages treat the visitor as having full blood-center access
 * (event posting + hospital approval) so they can be reached by URL.
 *
 * IMPORTANT:
 * - Set this back to `false` (and restore the <ProtectedRoute> guards in
 *   src/App.tsx) as soon as the backend auth flow is done.
 * - This only affects the frontend: every API call still requires a real
 *   backend session, so no backend data is exposed by this flag.
 */
export const TEMP_OPEN_ACCESS = true;

export default TEMP_OPEN_ACCESS;
