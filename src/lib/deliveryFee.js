// Shared delivery-fee rule used across the storefront and client catalogs.
// Orders of AED 200 or more ship free; below that a flat AED 50 delivery fee applies.
export const FREE_DELIVERY_THRESHOLD = 200;
export const DELIVERY_FEE = 50;
export const VAT_RATE = 0.05;

export function computeDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function amountUntilFreeDelivery(subtotal) {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
}

export function computeVat(subtotal) {
  return subtotal * VAT_RATE;
}
