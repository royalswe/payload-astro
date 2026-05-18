import type { CollectionAfterErrorHook } from 'payload'

/**
 * Catches the database unique-constraint violation on (parent, slug) and converts
 * it into a user-friendly error response. This is the safety net for the TOCTOU
 * race that the advisory `beforeValidate` hook cannot fully prevent.
 */
export const handleDuplicateSlugError: CollectionAfterErrorHook = ({ error }) => {
  // Postgres unique violation = code 23505; the constraint name from our migration
  const isUniqueViolation =
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: string }).code === '23505' &&
    'constraint' in error &&
    String((error as { constraint?: string }).constraint).includes('pages_parent_slug_idx')

  if (!isUniqueViolation) return

  return {
    response: {
      errors: [
        {
          message: 'A sibling page with this slug already exists under the same parent.',
          field: 'slug',
        },
      ],
      message: 'Validation Error',
    },
    status: 400,
  }
}
