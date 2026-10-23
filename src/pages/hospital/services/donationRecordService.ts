import type { DonationRecord, DonationRecordPayload } from '@/features/hospital/types/hospital-types';

/**
 * DONATION MEDICAL RECORD SERVICE — device-local storage.
 *
 * Flow: a hospital posts a blood request → a donor accepts it → the donor
 * comes to the facility and donates. Because every unit is laboratory-tested
 * before transfusion anyway, the hospital records the collection here:
 * units taken, infectious-disease screening, vitals, and the collection
 * outcome (cleared / deferred / rejected).
 *
 * The backend endpoints are not live yet, so records are persisted in this
 * browser's localStorage instead. The function signatures below are the
 * intended API contract — swap the localStorage calls for fetch() against
 * these endpoints when the backend ships, without touching call sites:
 *
 *   GET    /api/hospital/donations        -> list records (newest first)
 *   POST   /api/hospital/donations        -> create record
 *   DELETE /api/hospital/donations/:id    -> remove a mistaken entry
 *
 * Records saved here are real data entered by hospital staff on this device;
 * they are never synced anywhere until the backend endpoints exist.
 */

const STORAGE_KEY = 'legash_donation_records';

const readStore = (): DonationRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DonationRecord[]) : [];
  } catch {
    return [];
  }
};

const writeStore = (records: DonationRecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

/** GET /api/hospital/donations — newest first. */
export const listDonationRecords = async (): Promise<DonationRecord[]> => {
  return [...readStore()].sort((a, b) => {
    const left = new Date(a.donatedOn || a.recordedAt).getTime();
    const right = new Date(b.donatedOn || b.recordedAt).getTime();
    return right - left;
  });
};

/** POST /api/hospital/donations */
export const createDonationRecord = async (
  payload: DonationRecordPayload
): Promise<DonationRecord> => {
  const record: DonationRecord = {
    ...payload,
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    recordedAt: new Date().toISOString(),
  };
  writeStore([record, ...readStore()]);
  return record;
};

/** DELETE /api/hospital/donations/:id */
export const deleteDonationRecord = async (id: string): Promise<void> => {
  writeStore(readStore().filter((record) => record.id !== id));
};

export default { listDonationRecords, createDonationRecord, deleteDonationRecord };
