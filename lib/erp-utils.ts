export function generateOrderNumber(prefix: "SO" | "PO" | "MO"): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD format
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit random sequence
  return `${prefix}-${dateStr}-${randomStr}`;
}
