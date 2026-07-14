export const NULL_DISPLAY = "–";

export function formatPct(value: number | null): string {
  return value == null ? NULL_DISPLAY : `${value.toFixed(1)}%`;
}

export function formatNumber(value: number | null, decimals = 0): string {
  return value == null ? NULL_DISPLAY : value.toFixed(decimals);
}
