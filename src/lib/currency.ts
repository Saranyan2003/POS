import Decimal from "decimal.js";

// Set precision for currency arithmetic
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Formats an amount into Sri Lankan Rupees (e.g. "Rs. 1,250.00" or "LKR 1,250.00")
 */
export function formatLKR(amount: number | string | Decimal | null | undefined, includePrefix: boolean = true): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return includePrefix ? "Rs. 0.00" : "0.00";
  }

  const dec = new Decimal(amount.toString());
  const formatted = dec.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return includePrefix ? `Rs. ${formatted}` : formatted;
}

/**
 * Calculates exact line item total: (quantity * unitPrice) - discount
 */
export function calculateLineTotal(
  quantity: number | string,
  unitPrice: number | string,
  discount: number | string = 0
): { total: number; subtotal: number; discountAmount: number } {
  const q = new Decimal(quantity || 0);
  const p = new Decimal(unitPrice || 0);
  const d = new Decimal(discount || 0);

  const subtotal = q.times(p);
  const total = subtotal.minus(d).greaterThan(0) ? subtotal.minus(d) : new Decimal(0);

  return {
    subtotal: subtotal.toNumber(),
    discountAmount: d.toNumber(),
    total: total.toNumber(),
  };
}

/**
 * Calculates complete order totals including subtotal, order-level discount, and tax
 */
export function calculateOrderTotals(
  items: Array<{ quantity: number; unitPrice: number; discount?: number; costPrice?: number }>,
  orderDiscount: number = 0,
  taxRatePercent: number = 0
): {
  subtotal: number;
  itemsDiscount: number;
  orderDiscount: number;
  totalDiscount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  totalCost: number;
  estimatedProfit: number;
} {
  let subtotalDec = new Decimal(0);
  let itemsDiscountDec = new Decimal(0);
  let totalCostDec = new Decimal(0);

  for (const item of items) {
    const q = new Decimal(item.quantity || 0);
    const p = new Decimal(item.unitPrice || 0);
    const d = new Decimal(item.discount || 0);
    const c = new Decimal(item.costPrice || 0);

    const lineSubtotal = q.times(p);
    subtotalDec = subtotalDec.plus(lineSubtotal);
    itemsDiscountDec = itemsDiscountDec.plus(d);
    totalCostDec = totalCostDec.plus(q.times(c));
  }

  const orderDiscountDec = new Decimal(orderDiscount || 0);
  const totalDiscountDec = itemsDiscountDec.plus(orderDiscountDec);

  const discountedSubtotal = subtotalDec.minus(totalDiscountDec);
  const taxableAmountDec = discountedSubtotal.greaterThan(0) ? discountedSubtotal : new Decimal(0);

  const taxPercentDec = new Decimal(taxRatePercent || 0);
  const taxAmountDec = taxableAmountDec.times(taxPercentDec.dividedBy(100));

  const grandTotalDec = taxableAmountDec.plus(taxAmountDec);
  const estimatedProfitDec = grandTotalDec.minus(totalCostDec);

  return {
    subtotal: subtotalDec.toNumber(),
    itemsDiscount: itemsDiscountDec.toNumber(),
    orderDiscount: orderDiscountDec.toNumber(),
    totalDiscount: totalDiscountDec.toNumber(),
    taxableAmount: taxableAmountDec.toNumber(),
    taxAmount: taxAmountDec.toNumber(),
    grandTotal: grandTotalDec.toNumber(),
    totalCost: totalCostDec.toNumber(),
    estimatedProfit: estimatedProfitDec.toNumber(),
  };
}
