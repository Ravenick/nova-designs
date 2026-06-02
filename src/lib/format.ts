export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const dim = (ft: number, inches: number) =>
  inches > 0 ? `${ft}' ${inches}"` : `${ft}'`;

export const sqft = (n: number) =>
  new Intl.NumberFormat("en-US").format(n);
