/** 1234.5 → "1,234.50 UAH". Written by hand so the output is the same on every device. */
export function formatMoney(amount: number, currency: string): string {
  const [whole, cents] = amount.toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${grouped}.${cents} ${currency}`;
}
