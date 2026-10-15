export interface HospitalAnalyticsData {
  nationalTotals: Record<string, number>;
  topHospitals: Array<{ hospitalName: string; totalUnits: number }>;
  bottomHospitals: Array<{ hospitalName: string; totalUnits: number }>;
  trends: Array<Record<string, string | number>>;
}

export interface HospitalAnalyticsResponse {
  success: boolean;
  data: HospitalAnalyticsData;
}
