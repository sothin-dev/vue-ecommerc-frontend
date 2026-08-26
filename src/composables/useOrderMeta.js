export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export const STATUS_COLORS = {
  pending:    'bg-amber-100 text-amber-800 ring-amber-200',
  confirmed:  'bg-sky-100 text-sky-800 ring-sky-200',
  processing: 'bg-violet-100 text-violet-800 ring-violet-200',
  shipped:    'bg-blue-100 text-blue-800 ring-blue-200',
  delivered:  'bg-emerald-100 text-emerald-800 ring-emerald-200',
  cancelled:  'bg-red-100 text-red-800 ring-red-200'
}

export const PAYMENT_METHOD_LABELS = {
  cash_on_delivery: 'Cash on Delivery',
  bank_transfer:    'Bank Transfer',
  credit_card:      'Credit Card'
}

/**
 * Order status pipeline used for the tracking progress bar.
 * Cancelled is handled separately.
 */
export const TRACKING_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export function statusStep(status) {
  const idx = TRACKING_STEPS.indexOf(status)
  return idx === -1 ? -1 : idx
}
