export function formatPropertyPrice(price, listingType) {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Price on request";
  }

  if (listingType === "rent") {
    return `₹${amount.toLocaleString("en-IN")}/month`;
  }

  if (amount >= 10000000) {
    const crore = amount / 10000000;

    return `₹${Number(crore.toFixed(2))} Cr`;
  }

  if (amount >= 100000) {
    const lakh = amount / 100000;

    return `₹${Number(lakh.toFixed(2))} Lakh`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}