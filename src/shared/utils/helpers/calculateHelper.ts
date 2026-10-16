export const calculateTrend = (current: number, previous: number): string => {
  if (previous === 0) {
    return current > 0 ? "+100" : "0";
  }
  const diff = ((current - previous) / previous) * 100;
  const rounded = Math.round(diff);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
};
