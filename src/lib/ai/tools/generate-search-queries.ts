import { openai } from '@ai-sdk/openai'
import { generateObject, tool } from 'ai'
import { z } from 'zod'

import { saveResearchSearchQueries } from '@/features/research/queries'
import { TRANSFORM_QUERY_TO_OPENALEX_PROMPT } from '@/lib/prompts'

export const OpenAlexParamsSchema = z.object({
  // Core OpenAlexParams fields
  per_page: z
    .string()
    .optional()
    .default('3')
    .describe('Number of results per page (1-200) - default 3'),
  page: z.string().optional().describe('Page number for pagination'),
  search: z.string().optional().describe('General search term'),
  filter: z
    .object({
      // Authorship filters
      'authorships.countries': z
        .string()
        .optional()
        .describe('Countries of author institutions'),
      'authorships.institutions.country_code': z
        .string()
        .optional()
        .describe('Institution country code'),
      'institutions.country_code': z
        .string()
        .optional()
        .describe(
          'Alias for authorships.institutions.country_code - Institution country code'
        ),

      // Citation and impact filters
      cited_by_count: z
        .string()
        .optional()
        .describe('Number of times this work has been cited'),
      fwci: z.string().optional().describe('Field-weighted citation impact'),

      // Count filters
      countries_distinct_count: z
        .number()
        .optional()
        .describe('Number of distinct countries'),
      institutions_distinct_count: z
        .number()
        .optional()
        .describe('Number of distinct institutions'),

      // Content filters
      language: z
        .string()
        .optional()
        .describe('Language of the work (ISO 639-1 format)'),

      // Open access filters
      is_oa: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          'Alias for open_access.is_oa - Whether a work is Open Access'
        ),

      // Publication filters
      publication_year: z.number().optional().describe('Publication year'),
      publication_date: z
        .string()
        .optional()
        .describe('Publication date (YYYY-MM-DD format)'),

      // Work type filters
      type: z
        .enum([
          'article',
          'preprint',
          'paratext',
          'letter',
          'editorial',
          'erratum',
          'libguides',
          'supplementary-materials',
          'review',
        ])
        .optional()
        .describe('Type of work'),

      // Keyword filters
      'keywords.keyword': z
        .string()
        .optional()
        .describe('Keyword associated with the work'),

      // Convenience filters
      'authorships.institutions.continent': z
        .enum([
          'africa',
          'antarctica',
          'asia',
          'europe',
          'north_america',
          'oceania',
          'south_america',
        ])
        .optional()
        .describe(
          "Continent where at least one author's institution is located"
        ),
      'institutions.continent': z
        .enum([
          'africa',
          'antarctica',
          'asia',
          'europe',
          'north_america',
          'oceania',
          'south_america',
        ])
        .optional()
        .describe(
          "Alias for authorships.institutions.continent - Continent where at least one author's institution is located"
        ),
      'authorships.institutions.is_global_south': z
        .boolean()
        .optional()
        .describe(
          "Whether at least one author's institution is in the Global South"
        ),
      'institutions.is_global_south': z
        .boolean()
        .optional()
        .describe(
          "Alias for authorships.institutions.is_global_south - Whether at least one author's institution is in the Global South"
        ),

      from_created_date: z
        .string()
        .optional()
        .describe('Works created on or after this date (YYYY-MM-DD format)'),
      from_publication_date: z
        .string()
        .optional()
        .describe('Works published on or after this date (YYYY-MM-DD format)'),
      from_updated_date: z
        .string()
        .optional()
        .describe('Works updated on or after this date (ISO 8601 format)'),
      'fulltext.search': z
        .string()
        .optional()
        .describe('Text search using fulltext content'),
      has_references: z
        .boolean()
        .optional()
        .describe('Whether work has references'),
      mag_only: z
        .boolean()
        .optional()
        .describe('Whether work came from MAG (Microsoft Academic Graph) only'),
      'raw_affiliation_strings.search': z
        .string()
        .optional()
        .describe('Text search in raw affiliation strings'),
      'title_and_abstract.search': z
        .string()
        .optional()
        .describe('Text search across titles and abstracts for works'),
      to_created_date: z
        .string()
        .optional()
        .describe('Works created on or before this date (YYYY-MM-DD format)'),
      to_publication_date: z
        .string()
        .optional()
        .describe('Works published on or before this date (YYYY-MM-DD format)'),
      to_updated_date: z
        .string()
        .optional()
        .describe('Works updated on or before this date (ISO 8601 format)'),
    })
    .optional()
    .describe(
      'OpenAlex WorksFilters object - comprehensive filters for searching academic works'
    ),
})

// Define the exact zod schema matching OpenAlexParams<WorksFilters, {}, {}>
const OpenAlexParamsSchemas = z.object({
  queries: z
    .array(OpenAlexParamsSchema)
    .min(3)
    .max(3)
    .describe(
      'Array of exactly 3 OpenAlex params for comprehensive search coverage'
    ),
})

type Search = {
  query: string
  n?: number
  researchId: string
}

const generateSearchQueries = async ({ query, n = 3, researchId }: Search) => {
  const result = await generateObject({
    model: openai('gpt-4.1-nano'),
    schema: OpenAlexParamsSchemas,
    system: TRANSFORM_QUERY_TO_OPENALEX_PROMPT,
    prompt: `Generate exactly ${n} diverse OpenAlex-compatible search parameters for the following user query. Each query should approach the research topic from a different angle or strategy. You MUST call this tool first when searching for papers.
    
    <user_query>
    ${query}
    </user_query>
    `,
  })

  const queries = result.object.queries.map((query) => ({
    researchId,
    query,
  }))

  await saveResearchSearchQueries(queries)

  return {
    data: 'Search queries generated and saved to the database',
  }
}

export const generateSearchQueriesTool = tool({
  description:
    'Generate OpenAlex search parameters for a given user query. The results are saved to the database.',
  inputSchema: z.object({
    query: z.string(),
    researchId: z.string(),
  }),
  execute: async ({ query, researchId }) => {
    return generateSearchQueries({ query, researchId })
  },
})
