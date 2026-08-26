export function formatCurrency(value) {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function formatDate(value, withTime = false) {
  if (!value) return '—'
  const d = new Date(value.replace(' ', 'T'))
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  if (withTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  return d.toLocaleDateString('en-US', options)
}

export function truncate(text, length = 80) {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '…' : text
}
