export type OpenAlexResponse<T> = {
  meta: {
    count: number
    db_response_time_ms: number
    page: number
    per_page: number
  }
  results: T[]
}

export type OpenAlexParams<Filter, Sort, Select> = {
  per_page?: string
  page?: string
  filter?: Filter
  search?: string
  sort?: Sort
  select?: Select
}
