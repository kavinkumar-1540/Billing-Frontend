import { FolderKanban } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { EmptyState } from './EmptyState'

export function ModulePlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState
        icon={FolderKanban}
        title={`${title} coming soon`}
        description="This module's data and workflows will be built out in an upcoming phase."
      />
    </div>
  )
}