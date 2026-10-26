export interface NeedVsSupplyItem {
  bloodType: string;
  need: number;
  supply: number;
}

export interface WeeklyNeedVsSupplyItem {
  week: string;
  weekLabel: string;
  demand: number;
  donorDemand: number;
  bloodCenterDemand: number;
  fulfilledDemand: number;
  supply: number;
  byBloodType: Record<string, {
    demand: number;
    donorDemand: number;
    bloodCenterDemand: number;
    fulfilledDemand: number;
    supply: number;
  }>;
}

export interface HospitalAnalyticsData {
  nationalTotals: Record<string, number>;
  nationalNeed?: Record<string, number>;
  needVsSupply?: NeedVsSupplyItem[];
  weeklyNeedVsSupply?: WeeklyNeedVsSupplyItem[];
  topHospitals: Array<{ hospitalName: string; totalUnits: number }>;
  bottomHospitals: Array<{ hospitalName: string; totalUnits: number }>;
  trends?: Array<Record<string, string | number>>;
}

export interface HospitalAnalyticsResponse {
  success: boolean;
  data: HospitalAnalyticsData;
}
