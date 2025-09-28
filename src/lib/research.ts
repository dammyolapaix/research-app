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

export const OpenAlexParamsSchema = z.object({
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

      // Indexing filters
      indexed_in: z
        .enum(['arxiv', 'crossref', 'doaj', 'pubmed'])
        .optional()
        .describe('Where the work is indexed'),

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

export type OpenAlexParamsType = z.infer<typeof OpenAlexParamsSchema>
export type OpenAlexParamsSchemasType = z.infer<typeof OpenAlexParamsSchemas>

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
    .filter((paper) => {
      const hasPdfUrl =
        paper.primary_location?.pdf_url &&
        paper.primary_location.pdf_url !== null &&
        paper.primary_location.pdf_url !== undefined &&
        paper.primary_location.pdf_url.length > 0

      const hasOaUrl =
        paper.open_access?.oa_url &&
        paper.open_access.oa_url !== null &&
        paper.open_access.oa_url !== undefined &&
        paper.open_access.oa_url.length > 0

      return hasPdfUrl || hasOaUrl
    })
    .map((paper) => {
      const pdfUrl = paper.primary_location?.pdf_url
      const oaUrl = paper.open_access?.oa_url

      // Prefer PDF URL if available, otherwise use OA URL
      const url = pdfUrl && pdfUrl.length > 0 ? pdfUrl : oaUrl!

      return {
        title: paper.title,
        url,
      }
    })
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
