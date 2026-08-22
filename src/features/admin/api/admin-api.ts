/**
 * Admin API - canonical implementations are in src/pages/admin/api/admin-api.ts
 * This file re-exports them for any components that import from the features directory.
 */
export {
  fetchPendingHospitals,
  approveHospital,
  rejectHospital,
  fetchFeedbacks,
  markFeedbackReviewed,
  uploadMedia,
  createEvent,
  createAdmin,
  listAdmins,
} from '@/pages/admin/api/admin-api';