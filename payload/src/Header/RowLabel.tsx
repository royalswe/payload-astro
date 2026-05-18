'use client'
import { Header } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Header['navItems']>[number]>()

  const rowNum = data.rowNumber !== undefined ? data.rowNumber + 1 : ''
  let label = `Nav item ${rowNum}`

  if (data?.data?.type === 'folder' && data?.data?.label) {
    label = `Folder ${rowNum}: ${data.data.label}`
  } else if (data?.data?.link?.label) {
    label = `Link ${rowNum}: ${data.data.link.label}`
  }

  return <div>{label}</div>
}
