// Shared delivery-fee rule used across the storefront and client catalogs.
// Orders of AED 250 or more ship free; below that a flat AED 50 delivery fee applies.
export const FREE_DELIVERY_THRESHOLD = 250;
export const DELIVERY_FEE = 50;

export function computeDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function amountUntilFreeDelivery(subtotal) {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
}
