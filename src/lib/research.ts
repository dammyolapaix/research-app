import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { generateObject, generateText, stepCountIs, tool } from 'ai'
import { z } from 'zod'

import { scrape } from '@/services/firecrawl'
import { OpenAlexParams, WorksFilters, openAlex } from '@/services/openalex'

import {
  ANALYZE_RESEARCH_PAPER_SYSTEM_PROMPT,
  LITERATURE_REVIEW_SYSTEM_PROMPT,
  TRANSFORM_QUERY_TO_OPENALEX_PROMPT,
} from './prompts'

const OpenAlexParamsSchema = z.object({
  // Core OpenAlexParams fields
  per_page: z
    .string()
    .optional()
    .default('3')
    .describe('Number of results per page (1-200) - default 3'),
  page: z.string().optional().describe('Page number for pagination'),
  search: z.string().optional().describe('General search term'),
  // sort: z.record(z.string(), z.any()).optional().describe("Sort parameters"),
  // select: z
  //   .record(z.string(), z.any())
  //   .optional()
  //   .describe("Select specific fields"),

  // WorksFilters - all optional fields with proper types and descriptions
  filter: z
    .object({
      // Authorship filters
      'authorships.author.id': z
        .string()
        .optional()
        .describe('Authors for a work (OpenAlex ID)'),
      'author.id': z
        .string()
        .optional()
        .describe(
          'Alias for authorships.author.id - Authors for a work (OpenAlex ID)'
        ),
      'authorships.author.orcid': z
        .string()
        .optional()
        .describe('Authors for a work (ORCID)'),
      'author.orcid': z
        .string()
        .optional()
        .describe(
          'Alias for authorships.author.orcid - Authors for a work (ORCID)'
        ),
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
      'authorships.institutions.id': z
        .string()
        .optional()
        .describe(
          'Institutions affiliated with the authors of a work (OpenAlex ID)'
        ),
      'institutions.id': z
        .string()
        .optional()
        .describe(
          'Alias for authorships.institutions.id - Institutions affiliated with the authors of a work (OpenAlex ID)'
        ),
      'authorships.institutions.lineage': z
        .string()
        .optional()
        .describe('Institution lineage hierarchy'),
      'authorships.institutions.ror': z
        .string()
        .optional()
        .describe(
          'Institutions affiliated with the authors of a work (ROR ID)'
        ),
      'institutions.ror': z
        .string()
        .optional()
        .describe(
          'Alias for authorships.institutions.ror - Institutions affiliated with the authors of a work (ROR ID)'
        ),
      'authorships.institutions.type': z
        .string()
        .optional()
        .describe('Type of institution'),
      'authorships.is_corresponding': z
        .boolean()
        .optional()
        .describe(
          'Whether we have corresponding author information for a given work'
        ),
      is_corresponding: z
        .boolean()
        .optional()
        .describe(
          'Alias for authorships.is_corresponding - Whether we have corresponding author information'
        ),
      'authorships.affiliations.institution_ids': z
        .string()
        .optional()
        .describe('Institution IDs in author affiliations'),

      // APC filters
      'apc_list.value': z
        .number()
        .optional()
        .describe('Article Processing Charge value'),
      'apc_list.currency': z
        .string()
        .optional()
        .describe('Article Processing Charge currency'),
      'apc_list.provenance': z
        .string()
        .optional()
        .describe('Article Processing Charge data source'),
      'apc_list.value_usd': z
        .number()
        .optional()
        .describe('Article Processing Charge value in USD'),
      'apc_paid.value': z
        .number()
        .optional()
        .describe('Paid Article Processing Charge value'),
      'apc_paid.currency': z
        .string()
        .optional()
        .describe('Paid Article Processing Charge currency'),
      'apc_paid.provenance': z
        .string()
        .optional()
        .describe('Paid Article Processing Charge data source'),
      'apc_paid.value_usd': z
        .number()
        .optional()
        .describe('Paid Article Processing Charge value in USD'),

      // Best OA location filters
      'best_oa_location.is_accepted': z
        .boolean()
        .optional()
        .describe('Whether best OA location is accepted version'),
      'best_oa_location.is_published': z
        .boolean()
        .optional()
        .describe('Whether best OA location is published version'),
      'best_oa_location.license': z
        .string()
        .optional()
        .describe('The Open Access license for a work'),
      'best_oa_location.source.id': z
        .string()
        .optional()
        .describe('Best OA location source ID'),
      'best_oa_location.source.is_in_doaj': z
        .boolean()
        .optional()
        .describe('Whether best OA location source is in DOAJ'),
      'best_oa_location.source.issn': z
        .string()
        .optional()
        .describe('Best OA location source ISSN'),
      'best_oa_location.source.host_organization': z
        .string()
        .optional()
        .describe('Best OA location source host organization'),
      'best_oa_location.source.type': z
        .enum(['journal', 'conference', 'repository', 'publisher'])
        .optional()
        .describe('Best OA location source type'),
      'best_oa_location.version': z
        .enum(['publishedVersion', 'acceptedVersion', 'submittedVersion'])
        .nullable()
        .optional()
        .describe('Best OA location version'),

      // Biblio filters
      'biblio.first_page': z.string().optional().describe('First page number'),
      'biblio.issue': z.string().optional().describe('Issue number'),
      'biblio.last_page': z.string().optional().describe('Last page number'),
      'biblio.volume': z.string().optional().describe('Volume number'),

      // Citation and impact filters
      cited_by_count: z
        .number()
        .optional()
        .describe('Number of times this work has been cited'),
      fwci: z.number().optional().describe('Field-weighted citation impact'),

      // Concept filters
      'concepts.id': z
        .string()
        .optional()
        .describe('The concepts associated with a work'),
      'concept.id': z
        .string()
        .optional()
        .describe(
          'Alias for concepts.id - The concepts associated with a work'
        ),
      'concepts.wikidata': z
        .string()
        .optional()
        .describe('Concept Wikidata ID'),

      // Corresponding author/institution filters
      corresponding_author_ids: z
        .string()
        .optional()
        .describe('Corresponding authors for a work (OpenAlex ID)'),
      corresponding_institution_ids: z
        .string()
        .optional()
        .describe('Corresponding institution IDs'),

      // Count filters
      countries_distinct_count: z
        .number()
        .optional()
        .describe('Number of distinct countries'),
      institutions_distinct_count: z
        .number()
        .optional()
        .describe('Number of distinct institutions'),

      // DOI and ID filters
      doi: z
        .string()
        .optional()
        .describe('The DOI (Digital Object Identifier) of a work'),
      'ids.pmcid': z.string().optional().describe('PubMed Central identifier'),
      'ids.pmid': z.string().optional().describe('PubMed identifier'),
      pmid: z
        .string()
        .optional()
        .describe('Alias for ids.pmid - PubMed identifier'),
      'ids.openalex': z
        .string()
        .optional()
        .describe('The OpenAlex ID for a work'),
      openalex: z
        .string()
        .optional()
        .describe('Alias for ids.openalex - The OpenAlex ID for a work'),
      'ids.mag': z.string().optional().describe('Microsoft Academic Graph ID'),
      mag: z
        .string()
        .optional()
        .describe('Alias for ids.mag - Microsoft Academic Graph ID'),

      // Content filters
      fulltext_origin: z
        .enum(['pdf', 'ngrams'])
        .optional()
        .describe('Source of fulltext data'),
      has_fulltext: z
        .boolean()
        .optional()
        .describe('Whether work has fulltext available'),
      language: z
        .string()
        .optional()
        .describe('Language of the work (ISO 639-1 format)'),

      // Grant filters
      'grants.award_id': z.string().optional().describe('Award IDs for grants'),
      'grants.funder': z
        .string()
        .optional()
        .describe('Funding organizations linked to grants for a work'),

      // Indexing filters
      indexed_in: z
        .enum(['arxiv', 'crossref', 'doaj', 'pubmed'])
        .optional()
        .describe('Where the work is indexed'),

      // Location filters
      'locations.is_accepted': z
        .boolean()
        .optional()
        .describe('Whether location is accepted version'),
      'locations.is_oa': z
        .boolean()
        .optional()
        .describe('Whether location is open access'),
      'locations.is_published': z
        .boolean()
        .optional()
        .describe('Whether location is published version'),
      'locations.license': z.string().optional().describe('Location license'),
      'locations.source.id': z
        .string()
        .optional()
        .describe('Location source ID'),
      'locations.source.is_core': z
        .boolean()
        .optional()
        .describe('Whether location source is core'),
      'locations.source.is_in_doaj': z
        .boolean()
        .optional()
        .describe('Whether location source is in DOAJ'),
      'locations.source.issn': z
        .string()
        .optional()
        .describe('Location source ISSN'),
      'locations.source.host_organization': z
        .string()
        .optional()
        .describe('Location source host organization'),
      'locations.source.type': z
        .enum(['journal', 'conference', 'repository', 'publisher'])
        .optional()
        .describe('Location source type'),
      'locations.version': z
        .enum(['publishedVersion', 'acceptedVersion', 'submittedVersion'])
        .nullable()
        .optional()
        .describe('Location version'),
      locations_count: z.number().optional().describe('Number of locations'),

      // Open access filters
      'open_access.any_repository_has_fulltext': z
        .boolean()
        .optional()
        .describe('Whether any repository has fulltext'),
      'open_access.is_oa': z
        .boolean()
        .optional()
        .describe('Whether a work is Open Access'),
      is_oa: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          'Alias for open_access.is_oa - Whether a work is Open Access'
        ),
      'open_access.oa_status': z
        .enum(['diamond', 'gold', 'green', 'hybrid', 'bronze', 'closed'])
        .optional()
        .describe(
          'The Open Access status for a work (e.g., gold, green, hybrid, etc.)'
        ),
      oa_status: z
        .enum(['diamond', 'gold', 'green', 'hybrid', 'bronze', 'closed'])
        .optional()
        .describe(
          'Alias for open_access.oa_status - The Open Access status for a work'
        ),

      // Primary location filters
      'primary_location.is_accepted': z
        .boolean()
        .optional()
        .describe('Whether primary location is accepted version'),
      'primary_location.is_oa': z
        .boolean()
        .optional()
        .describe('Whether primary location is open access'),
      'primary_location.is_published': z
        .boolean()
        .optional()
        .describe('Whether primary location is published version'),
      'primary_location.license': z
        .string()
        .optional()
        .describe('Primary location license'),
      'primary_location.source.id': z
        .string()
        .optional()
        .describe('Primary location source ID'),
      'primary_location.source.is_core': z
        .boolean()
        .optional()
        .describe('Whether primary location source is core'),
      'primary_location.source.is_in_doaj': z
        .boolean()
        .optional()
        .describe('Whether primary location source is in DOAJ'),
      'primary_location.source.issn': z
        .string()
        .optional()
        .describe('Primary location source ISSN'),
      'primary_location.source.host_organization': z
        .string()
        .optional()
        .describe('Primary location source host organization'),
      'primary_location.source.type': z
        .enum(['journal', 'conference', 'repository', 'publisher'])
        .optional()
        .describe('Primary location source type'),
      'primary_location.version': z
        .enum(['publishedVersion', 'acceptedVersion', 'submittedVersion'])
        .nullable()
        .optional()
        .describe('Primary location version'),

      // Primary topic filters
      'primary_topic.id': z.string().optional().describe('Primary topic ID'),
      'primary_topic.domain.id': z
        .string()
        .optional()
        .describe('Primary topic domain ID'),
      'primary_topic.field.id': z
        .string()
        .optional()
        .describe('Primary topic field ID'),
      'primary_topic.subfield.id': z
        .string()
        .optional()
        .describe('Primary topic subfield ID'),

      // Publication filters
      publication_year: z.number().optional().describe('Publication year'),
      publication_date: z
        .string()
        .optional()
        .describe('Publication date (YYYY-MM-DD format)'),

      // Sustainable development goals
      'sustainable_development_goals.id': z
        .string()
        .optional()
        .describe('Sustainable Development Goal ID'),

      // Topic filters
      'topics.id': z.string().optional().describe('Topic ID'),
      'topics.domain.id': z.string().optional().describe('Topic domain ID'),
      'topics.field.id': z.string().optional().describe('Topic field ID'),
      'topics.subfield.id': z.string().optional().describe('Topic subfield ID'),

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
      type_crossref: z.string().optional().describe('Crossref work type'),

      // Work metadata filters
      is_paratext: z.boolean().optional().describe('Whether work is paratext'),
      is_retracted: z
        .boolean()
        .optional()
        .describe('Whether work is retracted'),

      // Keyword filters
      'keywords.keyword': z
        .string()
        .optional()
        .describe('Keyword associated with the work'),

      // Convenience filters
      'abstract.search': z
        .string()
        .optional()
        .describe('Text search using abstracts'),
      authors_count: z
        .number()
        .optional()
        .describe('Number of authors for a work'),
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
      best_open_version: z
        .enum(['any', 'acceptedOrPublished', 'published'])
        .optional()
        .describe(
          'Best open access version available (any, acceptedOrPublished, or published)'
        ),
      cited_by: z
        .string()
        .optional()
        .describe(
          'OpenAlex ID of work that cites this work (outgoing citations)'
        ),
      cites: z
        .string()
        .optional()
        .describe(
          'OpenAlex ID of work that this work cites (incoming citations)'
        ),
      concepts_count: z
        .number()
        .optional()
        .describe('Number of concepts assigned to the work'),
      'default.search': z
        .string()
        .optional()
        .describe(
          'Text search across titles, abstracts, and full text of works'
        ),
      'display_name.search': z
        .string()
        .optional()
        .describe('Text search across titles for works'),
      'title.search': z
        .string()
        .optional()
        .describe(
          'Alias for display_name.search - Text search across titles for works'
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
      has_abstract: z
        .boolean()
        .optional()
        .describe('Whether work has an abstract available'),
      has_doi: z
        .boolean()
        .optional()
        .describe('Whether work has a DOI assigned'),
      has_oa_accepted_or_published_version: z
        .boolean()
        .optional()
        .describe('Whether work has an OA accepted or published version'),
      has_oa_submitted_version: z
        .boolean()
        .optional()
        .describe('Whether work has an OA submitted version (preprint)'),
      has_orcid: z
        .boolean()
        .optional()
        .describe('Whether at least one author has an ORCID ID'),
      has_pmcid: z
        .boolean()
        .optional()
        .describe('Whether work has a PubMed Central identifier'),
      has_pmid: z
        .boolean()
        .optional()
        .describe('Whether work has a PubMed identifier'),
      has_ngrams: z
        .boolean()
        .optional()
        .describe(
          'DEPRECATED - Whether work has n-grams available for fulltext search'
        ),
      has_references: z
        .boolean()
        .optional()
        .describe('Whether work has references'),
      journal: z
        .string()
        .optional()
        .describe('OpenAlex ID of journal source for primary location'),
      'locations.source.host_institution_lineage': z
        .string()
        .optional()
        .describe('OpenAlex ID of institution in host organization lineage'),
      'locations.source.publisher_lineage': z
        .string()
        .optional()
        .describe('OpenAlex ID of publisher in host organization lineage'),
      mag_only: z
        .boolean()
        .optional()
        .describe('Whether work came from MAG (Microsoft Academic Graph) only'),
      'primary_location.source.has_issn': z
        .boolean()
        .optional()
        .describe('Whether primary location source has at least one ISSN'),
      'primary_location.source.publisher_lineage': z
        .string()
        .optional()
        .describe(
          'OpenAlex ID of publisher in primary location source lineage'
        ),
      'raw_affiliation_strings.search': z
        .string()
        .optional()
        .describe('Text search in raw affiliation strings'),
      related_to: z
        .string()
        .optional()
        .describe('OpenAlex ID of work to find related works'),
      repository: z
        .string()
        .optional()
        .describe('OpenAlex ID of repository source in locations'),
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
      version: z
        .enum(['publishedVersion', 'acceptedVersion', 'submittedVersion'])
        .nullable()
        .optional()
        .describe(
          'Version available in locations (publishedVersion, acceptedVersion, submittedVersion, or null)'
        ),
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

type OpenAlexParamsType = z.infer<typeof OpenAlexParamsSchema>

type SearchResult = {
  title: string
  url: string
  content: string
}

type Summary = {
  summary: string
  followUpQuestions: string[]
}

type Research = {
  query: string | undefined
  queries: OpenAlexParamsType[]
  searchResults: SearchResult[]
  summaries: Summary[]
  completedQueries: OpenAlexParamsType[]
}

const accumulatedResearch: Research = {
  query: undefined,
  queries: [],
  searchResults: [],
  summaries: [],
  completedQueries: [],
}

const openaiMainModel = openai('gpt-4.1-nano')
const googleMainModel = google('gemini-1.5-flash')

export const generateOpenAlexParams = async (prompt: string, n: number = 3) => {
  const result = await generateObject({
    model: openaiMainModel,
    schema: OpenAlexParamsSchemas,
    system: TRANSFORM_QUERY_TO_OPENALEX_PROMPT,
    // system: TRANSFORM_QUERY_TO_OPENALEX_PROMPT.replace("{query}", query),
    prompt: `Generate exactly ${n} diverse OpenAlex-compatible search parameters for the following query. Each query should approach the research topic from a different angle or strategy: ${prompt}`,
  })

  console.log('🔍 Original Query:', prompt)
  console.log('🎯 Transformed Parameters:', result.object)
  console.log('🔍 Transformed Parameters length:', result.object.queries.length)

  return result.object
}

export const searchPapers = async (
  params: OpenAlexParams<WorksFilters, {}, {}>
) => {
  const data = await openAlex.works.get(params)

  console.log(`Found ${data.results.length} papers`)

  data.results.map((paper) => {
    console.log(
      `Title: ${paper.title} and url: ${paper.primary_location?.pdf_url}`
    )
  })

  const papers = data.results
    .filter(
      (paper) =>
        paper.primary_location &&
        paper.primary_location.pdf_url !== null &&
        paper.primary_location.pdf_url !== undefined &&
        paper.primary_location.pdf_url.length > 0
    )
    .map((paper) => ({
      title: paper.title,
      url: paper.primary_location!.pdf_url!,
    }))
  console.log('Found papers: ')
  console.dir(papers, { depth: Infinity })

  return papers
}

export const getPaperContent = async (url: string, title?: string) => {
  if (title) {
    console.log(`Getting paper content for: ${title}`)
  }

  const markdown = await scrape(url)

  if (title) {
    console.log(`Got paper content for: ${title}`)
  }

  //   console.log("Markdown contents: ", markdownContents);
  //   console.log("Markdown contents length: ", markdownContents.length);

  return markdown
}

export const searchAndEvaluatePapers = async ({
  query,
  accumulatedSearchResults,
}: {
  query: OpenAlexParamsType
  accumulatedSearchResults: SearchResult[]
}) => {
  const pendingSearchResults: SearchResult[] = []
  const finalSearchResults: SearchResult[] = []

  await generateText({
    model: googleMainModel,
    prompt: `Search the OpenAlex api for papers about the query provided: ${JSON.stringify(query)}`,
    system:
      'You are a researcher. For each query, search the OpenAlex api and then evaluate if the results are relevant and will help answer the query provided. You MUST call the evaluatePapers tool after searching to properly evaluate the results.',
    stopWhen: stepCountIs(5),
    tools: {
      searchPapers: tool({
        description: 'Search openalex for papers about a given query',
        inputSchema: OpenAlexParamsSchema,
        execute: async (query) => {
          console.log('Searching papers for query: ', query)
          const searchResults: SearchResult[] = []
          const results = await searchPapers(query)

          for (const result of results) {
            const content = await getPaperContent(result.url, result.title)
            pendingSearchResults.push({
              title: result.title,
              url: result.url,
              content: content,
            })
            searchResults.push({
              title: result.title,
              url: result.url,
              content: content,
            })
          }

          console.log('Search results of searchPapers: ', searchResults)

          return searchResults
        },
      }),
      evaluatePapers: tool({
        description: 'Evaluate the paper for relevance',
        inputSchema: z.object({}),
        execute: async () => {
          console.log('Local pendingSearchResults: ', pendingSearchResults)
          const pendingResult = pendingSearchResults.pop()!

          // if (pendingSearchResults.length === 0) {
          //   return "No papers to evaluate. Please search for papers first.";
          // }

          // for (const result of pendingSearchResults) {
          console.log('Evaluating paper: ', pendingResult.title)
          const { object: evaluation } = await generateObject({
            model: googleMainModel,
            prompt: `Evaluate whether the paper is relevant and will help answer the following query: ${JSON.stringify(query)}. If the paper already exists in the existing results, mark it as irrelevant

            <paper>
            ${JSON.stringify(pendingResult)}
            </paper>
 
            <existing_papers>
            ${JSON.stringify(accumulatedSearchResults.map((result) => result.title))}
            </existing_papers>
            `,
            schema: z.object({
              evaluation: z.enum(['relevant', 'irrelevant']),
              reasoning: z
                .string()
                .describe(
                  'Brief explanation of why this paper is relevant or irrelevant'
                ),
            }),
          })

          if (evaluation.evaluation === 'relevant') {
            finalSearchResults.push(pendingResult)
            console.log(
              'Added relevant paper to final results: ',
              pendingResult.title
            )
          }

          console.log('Found:', pendingResult.url)
          console.log('Evaluation completed:', evaluation.evaluation)
          console.log('Reasoning:', evaluation.reasoning)
          // }

          console.log('Final search results: ', finalSearchResults)
          return `Evaluated ${pendingSearchResults.length} papers. Found ${finalSearchResults.length} relevant papers.`
        },
      }),
    },
    onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
      console.log('Step finish: ')
      console.log('Text: ', text)
      console.log('Tool calls: ', toolCalls)
      console.log('Tool results: ', toolResults)
      console.log('Finish reason: ', finishReason)
      console.log('Usage: ', usage)
    },
  })

  // // If no papers were evaluated (AI didn't call evaluatePapers), return all papers
  // if (finalSearchResults.length === 0 && pendingSearchResults.length > 0) {
  //   console.log(
  //     "No papers were evaluated, returning all papers for manual review"
  //   );
  //   return pendingSearchResults;
  // }

  return finalSearchResults
}

export const generatePaperSummary = async ({
  query,
  searchResult,
}: {
  query: string
  searchResult: SearchResult
}) => {
  const { object } = await generateObject({
    model: googleMainModel,
    system: ANALYZE_RESEARCH_PAPER_SYSTEM_PROMPT,
    prompt: `The user is researching "${query}". The following paper was deemed relevant. Generate a summary of the the paper and a follow-up question from the paper to further research the query.
    
    <search_results>
    ${searchResult.content},
    </search_results>
    `,
    schema: z.object({
      summary: z.string().describe('The summary of the paper'),
      followUpQuestions: z
        .array(z.string())
        .describe('The follow-up questions from the paper'),
    }),
  })
  return object
}

export const deepResearch = async ({
  prompt,
  depth = 2,
  breadth = 2,
}: {
  prompt: string
  depth: number
  breadth: number
}) => {
  // Initialize the accumulated research
  if (!accumulatedResearch.query) {
    accumulatedResearch.query = prompt
  }

  // If depth is 0, return the accumulated research
  if (depth === 0) {
    return accumulatedResearch
  }

  const { queries } = await generateOpenAlexParams(prompt)

  // logger.info(`: ${queries.}`)

  // console.log("Queries: ");
  // console.dir(queries, { depth: Infinity });
  // Add the queries to the accumulated research
  accumulatedResearch.queries = queries

  for (const query of queries) {
    // Search the OpenAlex api for the query
    console.log(`Searching the OpenAlex api for: ${query}`)
    const searchResults = await searchAndEvaluatePapers({
      query,
      accumulatedSearchResults: accumulatedResearch.searchResults,
    })
    console.log('Search results: ', searchResults)
    accumulatedResearch.searchResults.push(...searchResults)

    for (const searchResult of searchResults) {
      console.log('Generating summary for search result: ', searchResult.title)
      const summary = await generatePaperSummary({
        query: query.search!,
        searchResult,
      })
      accumulatedResearch.summaries.push(summary)
      accumulatedResearch.completedQueries.push(query)

      console.log(`Summary for ${searchResult.title}: `, summary.summary)
      console.log(
        `Follow-up question for ${searchResult.title}: `,
        summary.followUpQuestions
      )

      // call deepResearch recursively with decrementing depth and breadth
      const newQuery = `Overall research goal: ${prompt}
        Previous search queries: ${accumulatedResearch.completedQueries.map((query) => query.search!).join(', ')}
        Follow-up questions: ${summary.followUpQuestions.join(', ')}
        `
      await deepResearch({
        prompt: newQuery,
        depth: depth - 1,
        breadth: Math.ceil(breadth / 2),
      })
    }
  }

  return accumulatedResearch
}

export const generateLiteratureReview = async (research: Research) => {
  const { text } = await generateText({
    model: openai('o3-mini'),
    system: LITERATURE_REVIEW_SYSTEM_PROMPT,
    prompt:
      'Generate a literature review based on the following research data:\n\n' +
      JSON.stringify(research, null, 2),
  })
  return text
}

// const main = async () => {
//   const prompt =
//     "I'm interested in researching the effect of institutional qualities on inflation"

//   const research = await deepResearch({ prompt, depth: 2, breadth: 2 })

//   console.log('Research completed!')
//   console.log('Generating literature review...')
//   const report = await generateLiteratureReview(research)
//   console.log('Literature review generated! literature-review.md')
//   fs.writeFileSync('literature-review.md', report)
//   console.log('Literature review generated! literature-review.md')
// }

// main()
