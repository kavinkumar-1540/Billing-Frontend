/** Renders a paise integer as a formatted INR amount. */
export function MoneyDisplay({ paise, className }: { paise: number; className?: string }) {
  const rupees = paise / 100
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees)

  return <span className={className}>{formatted}</span>
}