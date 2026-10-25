export interface HospitalStockItem {
  id?: string;
  hospitalName: string;
  location?: {
    lat?: number | null;
    lng?: number | null;
    address?: string;
    mapsUrl?: string | null;
  } | null;
  phone: string;
  bloodType: string;
  availableUnits: number;
}

export interface HospitalStockResponse {
  success: boolean;
  data: HospitalStockItem[];
}
