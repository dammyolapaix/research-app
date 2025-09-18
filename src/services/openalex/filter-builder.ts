/**
 * Generic filter builder for OpenAlex API entities
 * This provides the core functionality that can be used by any entity type
 */

export type FilterOperator = '=' | '!=' | '>' | '>=' | '<' | '<=' | '~' | '!~'

/**
 * Generic filter builder base class
 * @template T - The filter interface type for the specific entity
 */
export class FilterBuilder<T extends Record<string, any>> {
  protected filters: T = {} as T

  /**
   * Add a filter with an operator
   * @param key - Filter key
   * @param operator - Filter operator
   * @param value - Filter value
   */
  withFilter<K extends keyof T>(
    key: K,
    operator: FilterOperator,
    value: T[K]
  ): this {
    if (value !== undefined && value !== null) {
      const filterKey = `${key.toString()}${operator}` as K
      this.filters[filterKey] = value
    }
    return this
  }

  /**
   * Add an equality filter
   * @param key - Filter key
   * @param value - Filter value
   */
  equals<K extends keyof T>(key: K, value: T[K]): this {
    return this.withFilter(key, '=', value)
  }

  /**
   * Add a not equals filter
   * @param key - Filter key
   * @param value - Filter value
   */
  notEquals<K extends keyof T>(key: K, value: T[K]): this {
    return this.withFilter(key, '!=', value)
  }

  /**
   * Add a greater than filter
   * @param key - Filter key
   * @param value - Filter value
   */
  greaterThan<K extends keyof T>(key: K, value: T[K]): this {
    return this.withFilter(key, '>', value)
  }

  /**
   * Add a greater than or equal filter
   * @param key - Filter key
   * @param value - Filter value
   */
  greaterThanOrEqual<K extends keyof T>(key: K, value: T[K]): this {
    return this.withFilter(key, '>=', value)
  }

  /**
   * Add a less than filter
   * @param key - Filter key
   * @param value - Filter value
   */
  lessThan<K extends keyof T>(key: K, value: T[K]): this {
    return this.withFilter(key, '<', value)
  }

  /**
   * Add a less than or equal filter
   * @param key - Filter key
   * @param value - Filter value
   */
  lessThanOrEqual<K extends keyof T>(key: K, value: T[K]): this {
    return this.withFilter(key, '<=', value)
  }

  /**
   * Add a contains filter (for text search)
   * @param key - Filter key
   * @param value - Filter value
   */
  contains<K extends keyof T>(key: K, value: T[K]): this {
    return this.withFilter(key, '~', value)
  }

  /**
   * Add a not contains filter
   * @param key - Filter key
   * @param value - Filter value
   */
  notContains<K extends keyof T>(key: K, value: T[K]): this {
    return this.withFilter(key, '!~', value)
  }

  /**
   * Add multiple filters at once
   * @param filters - Object containing multiple filters
   */
  withFilters(filters: Partial<T>): this {
    Object.assign(this.filters, filters)
    return this
  }

  /**
   * Build the final filters object
   */
  build(): T {
    return { ...this.filters }
  }

  /**
   * Build filter parameters for API requests
   * Converts the filters object to query parameters
   */
  buildFilterParams(): Record<string, string> {
    const filterParts: string[] = []

    for (const [key, value] of Object.entries(this.filters)) {
      if (value !== undefined && value !== null) {
        let filterValue: string

        // Convert boolean values to strings
        if (typeof value === 'boolean') {
          filterValue = value.toString()
        }
        // Convert number values to strings
        else if (typeof value === 'number') {
          filterValue = value.toString()
        }
        // Handle string values
        else if (typeof value === 'string') {
          filterValue = value
        }
        // Handle Date objects
        else if (value instanceof Date) {
          filterValue = value.toISOString().split('T')[0] || value.toISOString()
        }
        // Handle null values (convert to string)
        else if (value === null) {
          filterValue = 'null'
        } else {
          continue // Skip unknown types
        }

        filterParts.push(`${key}:${filterValue}`)
      }
    }

    // Return empty object if no filters, otherwise return the combined filter parameter
    return filterParts.length > 0 ? { filter: filterParts.join(',') } : {}
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.filters = {} as T
    return this
  }
}

/**
 * Build filter parameters from any filter object
 * Utility function for when you don't use the filter builder
 * @template T - The filter interface type
 * @param filters - The filters object
 * @returns Query parameters object
 */
export function buildFilterParams<T extends Record<string, any>>(
  filters: T
): Record<string, string> {
  const filterParts: string[] = []

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      let filterValue: string

      // Convert boolean values to strings
      if (typeof value === 'boolean') {
        filterValue = value.toString()
      }
      // Convert number values to strings
      else if (typeof value === 'number') {
        filterValue = value.toString()
      }
      // Handle string values
      else if (typeof value === 'string') {
        filterValue = value
      }
      // Handle Date objects
      else if (value instanceof Date) {
        filterValue = value.toISOString().split('T')[0] || value.toISOString()
      }
      // Handle null values (convert to string)
      else if (value === null) {
        filterValue = 'null'
      } else {
        continue // Skip unknown types
      }

      filterParts.push(`${key}:${filterValue}`)
    }
  }

  // Return empty object if no filters, otherwise return the combined filter parameter
  return filterParts.length > 0 ? { filter: filterParts.join(',') } : {}
}
