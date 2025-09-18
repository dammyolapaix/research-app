// Base entity types
export type BaseEntity = {
  id: string
  display_name: string
}

// Author entity
export type Author = BaseEntity & {
  orcid?: string
}

// Institution entity
export type Institution = BaseEntity & {
  ror?: string
  country_code?: string
  type?: string
}

// Source entity (for locations)
export type Source = BaseEntity & {
  issn_l?: string
  issn?: string[]
  host_organization?: string
  type?: 'journal' | 'conference' | 'repository' | 'publisher'
}

// Concept entity
export type Concept = BaseEntity & {
  wikidata?: string
  level: number
  score: number
}

// Topic entity
export type Topic = BaseEntity & {
  score: number
  subfield?: {
    id: number
    display_name: string
  }
  field?: {
    id: number
    display_name: string
  }
  domain?: {
    id: number
    display_name: string
  }
}

// Keyword entity
export type Keyword = BaseEntity & {
  score: number
}

// Grant entity
export type Grant = {
  funder: string
  funder_display_name: string
  award_id: string | null
}

// MeSH entity
export type Mesh = {
  descriptor_ui: string
  descriptor_name: string
  qualifier_ui?: string
  qualifier_name?: string
  is_major_topic: boolean
}

// Sustainable Development Goal entity
export type SustainableDevelopmentGoal = BaseEntity & {
  score: number
}

// Authorship object
export type Authorship = {
  author_position: 'first' | 'middle' | 'last' | 'only'
  author: Author
  institutions: Institution[]
  is_corresponding?: boolean
  raw_affiliation_strings?: string[]
}

// Location object
export type Location = {
  is_oa: boolean
  landing_page_url?: string
  pdf_url?: string | null
  source: Source
  license?: string | null
  version?: 'publishedVersion' | 'acceptedVersion' | 'submittedVersion'
}

// OpenAccess object
export type OpenAccess = {
  is_oa: boolean
  oa_status: 'diamond' | 'gold' | 'green' | 'hybrid' | 'bronze' | 'closed'
  oa_url?: string
  any_repository_has_fulltext?: boolean
}

// APC (Article Processing Charge) object
export type APC = {
  value: number
  currency: string
  provenance: string
  value_usd: number
}

// Citation normalized percentile object
export type CitationNormalizedPercentile = {
  value: number
  is_in_top_1_percent: boolean
  is_in_top_10_percent: boolean
}

// Count by year object
export type CountByYear = {
  year: number
  cited_by_count: number
}

// Bibliographic info object
export type Biblio = {
  volume?: string
  issue?: string
  first_page?: string
  last_page?: string
}

// Work IDs object
export type WorkIds = {
  openalex?: string
  doi?: string
  mag?: number
  pmid?: string
  pmcid?: string
}

// Abstract inverted index type
export type AbstractInvertedIndex = Record<string, number[]>

// Main Work object
export type Work = BaseEntity & {
  // Core identifiers
  ids: WorkIds
  doi?: string

  // Basic information
  title: string
  display_name: string // Same as title
  type:
    | 'article'
    | 'preprint'
    | 'paratext'
    | 'letter'
    | 'editorial'
    | 'erratum'
    | 'libguides'
    | 'supplementary-materials'
    | 'review'
    | string
  type_crossref?: string

  // Publication information
  publication_date?: string // ISO 8601 date
  publication_year?: number
  language?: string // ISO 639-1 format

  // Content
  abstract_inverted_index?: AbstractInvertedIndex
  has_fulltext?: boolean
  fulltext_origin?: 'pdf' | 'ngrams'

  // Authors and institutions
  authorships: Authorship[]
  corresponding_author_ids?: string[]
  corresponding_institution_ids?: string[]
  institutions_distinct_count?: number
  countries_distinct_count?: number

  // Locations and access
  primary_location?: Location
  locations: Location[]
  locations_count?: number
  best_oa_location?: Location
  open_access?: OpenAccess
  license?: string

  // Citations and impact
  cited_by_count: number
  cited_by_api_url?: string
  counts_by_year?: CountByYear[]
  fwci?: number
  citation_normalized_percentile?: CitationNormalizedPercentile

  // Related works
  referenced_works?: string[]
  related_works?: string[]

  // Classification and topics
  concepts?: Concept[]
  topics?: Topic[]
  primary_topic?: Topic
  keywords?: Keyword[]
  mesh?: Mesh[]
  sustainable_development_goals?: SustainableDevelopmentGoal[]

  // Financial information
  apc_list?: APC
  apc_paid?: APC
  grants?: Grant[]

  // Bibliographic information
  biblio?: Biblio

  // Metadata
  is_paratext?: boolean
  is_retracted?: boolean
  indexed_in?: ('arxiv' | 'crossref' | 'doaj' | 'pubmed')[]

  // Dates
  created_date?: string // ISO 8601 date
  updated_date?: string // ISO 8601 date
}

// Filter types for works endpoint
export type FilterOperator = '=' | '!=' | '>' | '>=' | '<' | '<=' | '~' | '!~'

// Base filter value types
export type FilterValue = string | number | boolean | Date

// Date filter value (ISO 8601 format)
export type DateFilterValue = string // Format: "yyyy-mm-dd" or "yyyy-mm-ddThh:mm:ss"

// Continent filter values
export type ContinentFilterValue =
  | 'africa'
  | 'antarctica'
  | 'asia'
  | 'europe'
  | 'north_america'
  | 'oceania'
  | 'south_america'

// Version filter values
export type VersionFilterValue =
  | 'publishedVersion'
  | 'acceptedVersion'
  | 'submittedVersion'
  | null

// Best open version filter values
export type BestOpenVersionFilterValue =
  | 'any'
  | 'acceptedOrPublished'
  | 'published'

// Work type filter values
export type WorkTypeFilterValue =
  | 'article'
  | 'preprint'
  | 'paratext'
  | 'letter'
  | 'editorial'
  | 'erratum'
  | 'libguides'
  | 'supplementary-materials'
  | 'review'

// OA status filter values
export type OAStatusFilterValue =
  | 'diamond'
  | 'gold'
  | 'green'
  | 'hybrid'
  | 'bronze'
  | 'closed'

// Source type filter values
export type SourceTypeFilterValue =
  | 'journal'
  | 'conference'
  | 'repository'
  | 'publisher'

// Indexed in filter values
export type IndexedInFilterValue = 'arxiv' | 'crossref' | 'doaj' | 'pubmed'

// Fulltext origin filter values
export type FulltextOriginFilterValue = 'pdf' | 'ngrams'

// Language filter values (ISO 639-1 format)
export type LanguageFilterValue = string

// Works filter type
export type WorksFilters = {
  // Authorship filters
  'authorships.author.id'?: string
  'author.id'?: string // alias
  'authorships.author.orcid'?: string
  'author.orcid'?: string // alias
  'authorships.countries'?: string
  'authorships.institutions.country_code'?: string
  'institutions.country_code'?: string // alias
  'authorships.institutions.id'?: string
  'institutions.id'?: string // alias
  'authorships.institutions.lineage'?: string
  'authorships.institutions.ror'?: string
  'institutions.ror'?: string // alias
  'authorships.institutions.type'?: string
  'authorships.is_corresponding'?: boolean
  is_corresponding?: boolean // alias
  'authorships.affiliations.institution_ids'?: string

  // APC filters
  'apc_list.value'?: number
  'apc_list.currency'?: string
  'apc_list.provenance'?: string
  'apc_list.value_usd'?: number
  'apc_paid.value'?: number
  'apc_paid.currency'?: string
  'apc_paid.provenance'?: string
  'apc_paid.value_usd'?: number

  // Best OA location filters
  'best_oa_location.is_accepted'?: boolean
  'best_oa_location.is_published'?: boolean
  'best_oa_location.license'?: string
  'best_oa_location.source.id'?: string
  'best_oa_location.source.is_in_doaj'?: boolean
  'best_oa_location.source.issn'?: string
  'best_oa_location.source.host_organization'?: string
  'best_oa_location.source.type'?: SourceTypeFilterValue
  'best_oa_location.version'?: VersionFilterValue

  // Biblio filters
  'biblio.first_page'?: string
  'biblio.issue'?: string
  'biblio.last_page'?: string
  'biblio.volume'?: string

  // Citation and impact filters
  cited_by_count?: number
  fwci?: number

  // Concept filters
  'concepts.id'?: string
  'concept.id'?: string // alias
  'concepts.wikidata'?: string

  // Corresponding author/institution filters
  corresponding_author_ids?: string
  corresponding_institution_ids?: string

  // Count filters
  countries_distinct_count?: number
  institutions_distinct_count?: number

  // DOI and ID filters
  doi?: string
  'ids.pmcid'?: string
  'ids.pmid'?: string
  pmid?: string // alias
  'ids.openalex'?: string
  openalex?: string // alias
  'ids.mag'?: string
  mag?: string // alias

  // Content filters
  fulltext_origin?: FulltextOriginFilterValue
  has_fulltext?: boolean
  language?: LanguageFilterValue

  // Grant filters
  'grants.award_id'?: string
  'grants.funder'?: string

  // Indexing filters
  indexed_in?: IndexedInFilterValue

  // Location filters
  'locations.is_accepted'?: boolean
  'locations.is_oa'?: boolean
  'locations.is_published'?: boolean
  'locations.license'?: string
  'locations.source.id'?: string
  'locations.source.is_core'?: boolean
  'locations.source.is_in_doaj'?: boolean
  'locations.source.issn'?: string
  'locations.source.host_organization'?: string
  'locations.source.type'?: SourceTypeFilterValue
  'locations.version'?: VersionFilterValue
  locations_count?: number

  // Open access filters
  'open_access.any_repository_has_fulltext'?: boolean
  'open_access.is_oa'?: boolean
  is_oa?: boolean // alias
  'open_access.oa_status'?: OAStatusFilterValue
  oa_status?: OAStatusFilterValue // alias

  // Primary location filters
  'primary_location.is_accepted'?: boolean
  'primary_location.is_oa'?: boolean
  'primary_location.is_published'?: boolean
  'primary_location.license'?: string
  'primary_location.source.id'?: string
  'primary_location.source.is_core'?: boolean
  'primary_location.source.is_in_doaj'?: boolean
  'primary_location.source.issn'?: string
  'primary_location.source.host_organization'?: string
  'primary_location.source.type'?: SourceTypeFilterValue
  'primary_location.version'?: VersionFilterValue

  // Primary topic filters
  'primary_topic.id'?: string
  'primary_topic.domain.id'?: string
  'primary_topic.field.id'?: string
  'primary_topic.subfield.id'?: string

  // Publication filters
  publication_year?: number
  publication_date?: DateFilterValue

  // Sustainable development goals
  'sustainable_development_goals.id'?: string

  // Topic filters
  'topics.id'?: string
  'topics.domain.id'?: string
  'topics.field.id'?: string
  'topics.subfield.id'?: string

  // Work type filters
  type?: WorkTypeFilterValue
  type_crossref?: string

  // Work metadata filters
  is_paratext?: boolean
  is_retracted?: boolean

  // Keyword filters
  'keywords.keyword'?: string

  // Convenience filters
  'abstract.search'?: string
  authors_count?: number
  'authorships.institutions.continent'?: ContinentFilterValue
  'institutions.continent'?: ContinentFilterValue // alias
  'authorships.institutions.is_global_south'?: boolean
  'institutions.is_global_south'?: boolean // alias
  best_open_version?: BestOpenVersionFilterValue
  cited_by?: string
  cites?: string
  concepts_count?: number
  'default.search'?: string
  'display_name.search'?: string
  'title.search'?: string // alias
  from_created_date?: DateFilterValue
  from_publication_date?: DateFilterValue
  from_updated_date?: DateFilterValue
  'fulltext.search'?: string
  has_abstract?: boolean
  has_doi?: boolean
  has_oa_accepted_or_published_version?: boolean
  has_oa_submitted_version?: boolean
  has_orcid?: boolean
  has_pmcid?: boolean
  has_pmid?: boolean
  has_ngrams?: boolean // DEPRECATED
  has_references?: boolean
  journal?: string
  'locations.source.host_institution_lineage'?: string
  'locations.source.publisher_lineage'?: string
  mag_only?: boolean
  'primary_location.source.has_issn'?: boolean
  'primary_location.source.publisher_lineage'?: string
  'raw_affiliation_strings.search'?: string
  related_to?: string
  repository?: string
  'title_and_abstract.search'?: string
  to_created_date?: DateFilterValue
  to_publication_date?: DateFilterValue
  to_updated_date?: DateFilterValue
  version?: VersionFilterValue
}

// Work response type for API calls
export type WorkResponse = {
  meta: {
    count: number
    db_response_time_ms: number
    page: number
    per_page: number
  }
  results: Work[]
}
