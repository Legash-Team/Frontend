import axiosInstance from '@/api/axiosInstance';
import type {
  DonationOutcomePayload,
  PendingCountResponse,
  PendingDonation,
} from '@/features/hospital/types/hospital-types';

/**
 * DONATION QUEUE SERVICE — hospital dashboard pending-donation notifications.
 *
 * This pairs with Backend's donation-history workflow. The dashboard uses only
 * the lightweight count endpoint to decide whether to show the banner — it
 * never pulls every pending donor's full details just for the indicator.
 *
 * Backend endpoints:
 *   GET  /api/hospital/donation-records/pending/count  -> { count }
 *   GET  /api/hospital/donation-records/pending        -> PendingDonation[]
 *   POST /api/hospital/donation-records                -> records the outcome
 */

const PENDING_URL = '/api/hospital/donation-records/pending';
const COUNT_URL = '/api/hospital/donation-records/pending/count';
const RECORD_URL = '/api/hospital/donation-records';

/** Lightweight dashboard check: how many pending donation records await confirmation. */
export const getPendingDonationCount = async (): Promise<number> => {
  const response = await axiosInstance.get<PendingCountResponse>(COUNT_URL);
  return Number(response.data?.count ?? 0);
};

/** Full pending donor queue, oldest acceptance first (one-at-a-time modal source). */
export const getPendingDonationQueue = async (): Promise<PendingDonation[]> => {
  const response = await axiosInstance.get<PendingDonation[]>(PENDING_URL);
  return Array.isArray(response.data) ? response.data : [];
};

/** Record the outcome for the donor currently shown in the queue modal. */
export const recordDonationOutcome = async (
  payload: DonationOutcomePayload
): Promise<void> => {
  await axiosInstance.post(RECORD_URL, payload);
};

export default {
  getPendingDonationCount,
  getPendingDonationQueue,
  recordDonationOutcome,
};
