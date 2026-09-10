export function checkoutTotal(items: number[]): number {
  return items.reduce((total, item) => total + item, 0);
}
