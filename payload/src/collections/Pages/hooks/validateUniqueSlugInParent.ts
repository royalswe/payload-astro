import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'

/**
 * Ensures that no two sibling pages (same parent) share the same slug.
 * This replaces the global unique index on `slug` which was too restrictive
 * for nested page hierarchies.
 */
export const validateUniqueSlugInParent: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req: { payload },
}) => {
  const slug = data?.slug ?? originalDoc?.slug
  if (!slug) return data

  // Determine the parent — could be an ID or a populated object
  const rawParent = data && 'parent' in data ? data.parent : originalDoc?.parent
  const parentId = rawParent && typeof rawParent === 'object' ? rawParent.id : (rawParent ?? null)
  const currentId = originalDoc?.id

  const existing = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
      parent: parentId ? { equals: parentId } : { exists: false },
      ...(operation === 'update' && currentId ? { id: { not_equals: currentId } } : {}),
    },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    throw new ValidationError({
      errors: [
        {
          message: `A sibling page with the slug "${slug}" already exists under the same parent.`,
          path: 'slug',
        },
      ],
    })
  }

  return data
}
