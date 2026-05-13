import type { RiskLevel } from "./order";

export interface ScoreResult {
  score: number;
  riskLevel: RiskLevel;
  signals: string[];
}

export interface RiskSignal {
  type: string;
  label: string;
  weight: number;
  detected: boolean;
}

export interface RiskExplanation {
  level: string;
  summary: string;
  signals: RiskSignal[];
  recommendation: string;
}

export interface RiskDashboardStats {
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  highRiskCount: number;
  verificationRate: number;
  recentOrders: RecentRiskOrder[];
}

export interface RecentRiskOrder {
  id: string;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  riskLevel: RiskLevel;
  trustScore: number;
  verificationStatus: string;
  status: string;
  createdAt: string;
}

export interface BlacklistEntry {
  buyerPhone: string;
  buyerName: string;
  createdAt: Date;
}

export interface RiskAlertItem {
  id: string;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  riskLevel: RiskLevel;
  trustScore: number;
  signal: string;
  orderId: string;
}

export interface RiskAggregateStats {
  averageScore: number;
  highRiskCount: number;
  todayOrders: number;
  totalOrders: number;
  revenueAtRisk: number;
}
