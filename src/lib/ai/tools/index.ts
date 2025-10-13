import { ToolSet } from 'ai'

import { evaluatePaperTool } from './evaluate-paper'
import { generateSearchQueriesTool } from './generate-search-queries'
import { getPaperContentTool } from './get-paper-content'
import { getResearchTool } from './get-research'
import { searchPapersTool } from './search-papers'

export const tools = {
  getResearch: getResearchTool,
  generateSearchQueries: generateSearchQueriesTool,
  searchPapers: searchPapersTool,
  getPaperContent: getPaperContentTool,
  evaluatePaper: evaluatePaperTool,
} satisfies ToolSet
