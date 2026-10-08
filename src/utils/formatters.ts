/**
 * Utilidades de formateo para datos de la provincia de Jujuy
 */

export function formatNumber(val: number | null | undefined, decimals = 0): string {
  if (val === null || val === undefined || isNaN(val)) {
    return 'Sin dato';
  }
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatCurrencyMiles(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return 'Sin dato';
  }
  return `$ ${formatNumber(val, 0)} mil`;
}

export function formatPercent(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) {
    return 'Sin dato';
  }
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${formatNumber(val, decimals)}%`;
}
