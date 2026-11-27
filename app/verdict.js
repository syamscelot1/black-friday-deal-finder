// Verdict logic: is this really a deal? One job only — turn a deal's prices and
// its checked evidence into a verdict label, a short reason and a rank for sorting.
// Nothing here invents prices: the percentage is always computed from sale/usual.

export function discountPct(deal) {
  return Math.round(((deal.usual - deal.sale) / deal.usual) * 100);
}

export function amountSaved(deal) {
  return deal.usual - deal.sale;
}

export function money(n) {
  return "$" + n.toFixed(2).replace(/\.00$/, "");
}

// Verdict levels, best first. A deal is a "Record low" only when its research
// evidence says a tracker called it an all-time/record low (deal.low === true).
// Otherwise the verdict follows the computed discount: >=40% strong, >=20% good.
export function verdictFor(deal) {
  const pct = discountPct(deal);
  if (deal.low) {
    return { level: "record", rank: 0, label: "Record low", short: "Lowest price ever tracked" };
  }
  if (pct >= 40) {
    return { level: "strong", rank: 1, label: "Strong deal", short: pct + "% off list price" };
  }
  if (pct >= 20) {
    return { level: "good", rank: 2, label: "Good deal", short: pct + "% off list price" };
  }
  return { level: "modest", rank: 3, label: "Modest deal", short: "Small cut — the only one of its kind" };
}

// "Top deals": record lows first, then by discount, then by dollars saved.
export function topDeals(deals, n) {
  return [...deals]
    .map((d) => ({ deal: d, v: verdictFor(d), pct: discountPct(d) }))
    .sort((a, b) => a.v.rank - b.v.rank || b.pct - a.pct || amountSaved(b.deal) - amountSaved(a.deal))
    .slice(0, n)
    .map((x) => x.deal);
}

export const VERDICT_ORDER = ["record", "strong", "good", "modest"];
