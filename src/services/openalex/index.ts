// Export all types
export * from './types'
export * from './entities/works/types'
export { openAlex } from './client'
export { Works } from './entities/works'

// Export generic filter builder
export { FilterBuilder, buildFilterParams } from './filter-builder'
