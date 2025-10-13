import { firecrawl } from './client'

export const scrape = async (url: string) => {
  const response = await firecrawl.scrape(url, {
    formats: ['markdown'],
    timeout: 200000,
  })

  return response.markdown!
}

type BatchScrapeResponse = {
  url: string
  markdown: string
}

export const batchScrape = async (urls: string[]) => {
  const responses = await firecrawl.batchScrape(urls, {
    options: {
      formats: ['markdown'],
      timeout: 200000,
    },
  })

  let data: BatchScrapeResponse[] = []
  if (responses.status === 'completed') {
    data = responses.data.map((response) => ({
      url: response.metadata?.sourceURL!,
      markdown: response.markdown!,
    }))
  }

  if (responses.status === 'failed') throw new Error('Error scraping URLs')
  if (responses.status === 'cancelled') throw new Error('Error scraping URLs')

  return data
}
