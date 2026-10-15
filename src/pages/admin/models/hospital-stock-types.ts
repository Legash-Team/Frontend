export interface HospitalStockItem {
  hospitalName: string;
  location?: { address?: string };
  phone: string;
  bloodType: string;
  availableUnits: number;
}

export interface HospitalStockResponse {
  success: boolean;
  data: HospitalStockItem[];
}
