import { useQuery } from '@tanstack/react-query'
import { fetchParties } from '@/features/parties/parties.api'
import type { PartyType } from '@/features/parties/parties.types'

interface PartySelectorProps {
  partyType: Exclude<PartyType, 'BOTH'>
  value: string
  onChange: (partyId: string) => void
  label?: string
  required?: boolean
}

export function PartySelector({ partyType, value, onChange, label, required }: PartySelectorProps) {
  const { data } = useQuery({
    queryKey: ['parties', partyType, 'selector'],
    queryFn: () => fetchParties(partyType, { limit: 200 }),
  })

  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-slate-300">{label}</label>}
      <select
        required={required}
        className="glass-input flex h-9 w-full cursor-pointer rounded-xl px-3 text-sm font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select {partyType === 'CUSTOMER' ? 'customer' : 'supplier'}</option>
        {data?.items.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} {p.gstin ? `(${p.gstin})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}