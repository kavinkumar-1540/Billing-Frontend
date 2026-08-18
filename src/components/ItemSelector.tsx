import { useQuery } from '@tanstack/react-query'
import { fetchItems } from '@/features/items/items.api'

interface ItemSelectorProps {
  value: string
  onChange: (itemId: string) => void
}

export function ItemSelector({ value, onChange }: ItemSelectorProps) {
  const { data } = useQuery({
    queryKey: ['items', 'selector'],
    queryFn: () => fetchItems({ limit: 200 }),
  })

  return (
    <select
      required
      className="glass-input flex h-9 w-full cursor-pointer rounded-lg px-2 text-sm font-medium"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select item</option>
      {data?.items.map((i) => (
        <option key={i._id} value={i._id}>
          {i.name} ({i.sku})
        </option>
      ))}
    </select>
  )
}