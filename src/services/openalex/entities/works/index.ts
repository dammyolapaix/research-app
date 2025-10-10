import { buildFilterParams } from '../../filter-builder'
import { HttpClient } from '../../http-client'
import { OpenAlexResponse } from '../../types'
import { GetWorksOpenAlexParams, Work } from './types'

// Export filter builder utilities from the generic filter builder
export { buildFilterParams, FilterBuilder } from '../../filter-builder'

export class Works {
  private httpClient: HttpClient
  private baseUrl: string = '/works' as const

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient
  }

  /**
   * Get works with type-safe filters
   * @param filters - Type-safe filter object
   * @param additionalParams - Additional query parameters (search, sort, page, per_page, etc.)
   */
  async get(params: GetWorksOpenAlexParams): Promise<OpenAlexResponse<Work>> {
    // Convert filters to query parameters
    const filterParams = buildFilterParams(params.filter ?? {})

    console.log('filterParams', filterParams)

    // Extract non-filter params and convert to string values
    const { filter, ...otherParams } = params

    // Combine filter params with other params
    const allParams = { ...filterParams, ...otherParams } as Record<
      string,
      string
    >

    return this.httpClient.get<OpenAlexResponse<Work>>(this.baseUrl, allParams)
  }
}
