// Formatea números como string en formato en-US (punto decimal)
export function formatNumber(num: number, decimals = 8): string {
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: false,
  });
} 