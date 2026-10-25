import axiosInstance from '@/api/axiosInstance';
import type { DonationRecord, DonationRecordPayload } from '@/features/hospital/types/hospital-types';

/**
 * DONATION MEDICAL RECORD SERVICE — connected to real backend API.
 * The backend is the authoritative source of truth.
 *
 * GET    /api/hospital/donation-records     -> list records
 * POST   /api/hospital/donation-records     -> create record
 * DELETE /api/hospital/donation-records/:id -> remove record
 */

/** GET /api/hospital/donation-records — newest first. */
export const listDonationRecords = async (): Promise<DonationRecord[]> => {
  try {
    const res = await axiosInstance.get<{
      success: boolean;
      records?: DonationRecord[];
      data?: DonationRecord[];
    }>('/api/hospital/donation-records');

    const list = res.data?.records || res.data?.data || [];
    return list.sort((a, b) => {
      const left = new Date(a.donatedOn || a.recordedAt).getTime();
      const right = new Date(b.donatedOn || b.recordedAt).getTime();
      return right - left;
    });
  } catch (err: any) {
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to fetch donation records.');
  }
};

/** POST /api/hospital/donation-records */
export const createDonationRecord = async (
  payload: DonationRecordPayload
): Promise<DonationRecord> => {
  try {
    const res = await axiosInstance.post<{
      success: boolean;
      message?: string;
      record: DonationRecord;
    }>('/api/hospital/donation-records', {
      bloodRequestId: payload.requestId,
      requestId: payload.requestId,
      bloodRequestResponseId: payload.responseId,
      responseId: payload.responseId,
      outcome: payload.outcome,
      donationDate: payload.donatedOn,
      donatedOn: payload.donatedOn,
      donorBloodType: payload.bloodType,
      bloodType: payload.bloodType,
      unitsCollected: payload.unitsCollected,
      pulse: payload.vitals?.pulse,
      hemoglobin: payload.vitals?.hemoglobin,
      systolic: payload.vitals?.systolic,
      diastolic: payload.vitals?.diastolic,
      temperature: payload.vitals?.temperature,
      screening: payload.screening,
      notes: payload.notes,
      recordedBy: payload.recordedBy,
    });

    return res.data.record;
  } catch (err: any) {
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to save donation record.');
  }
};

/** DELETE /api/hospital/donation-records/:id */
export const deleteDonationRecord = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/hospital/donation-records/${id}`);
  } catch (err: any) {
    throw new Error(err?.response?.data?.error || err?.message || 'Failed to delete donation record.');
  }
};

export default { listDonationRecords, createDonationRecord, deleteDonationRecord };
