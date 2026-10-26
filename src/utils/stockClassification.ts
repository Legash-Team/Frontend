export type StockLevel = 'adequate' | 'limited' | 'low';

export interface StockClassification {
  level: StockLevel;
  labelKey: string;
  defaultLabel: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
}

/**
 * Classifies blood stock units consistently according to Legash platform specifications:
 * - Adequate: quantity >= 25
 * - Limited: quantity > 10 and < 25 (11–24 units)
 * - Low: quantity <= 10 (or missing/invalid)
 */
export function getStockClassification(units: number | null | undefined): StockClassification {
  const num = typeof units === 'number' && !isNaN(units) && units >= 0 ? units : 0;

  if (num >= 25) {
    return {
      level: 'adequate',
      labelKey: 'hospitalDashboard.adequate',
      defaultLabel: 'Adequate stock',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      borderClass: 'border-emerald-200',
      textClass: 'text-emerald-700',
    };
  }

  if (num >= 11) {
    return {
      level: 'limited',
      labelKey: 'hospitalDashboard.limitedStock',
      defaultLabel: 'Limited stock',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      borderClass: 'border-amber-200',
      textClass: 'text-amber-700',
    };
  }

  return {
    level: 'low',
    labelKey: 'hospitalDashboard.lowStock',
    defaultLabel: 'Low stock',
    badgeClass: 'bg-crimson/10 text-crimson border-crimson/20',
    borderClass: 'border-crimson/20',
    textClass: 'text-crimson',
  };
}
