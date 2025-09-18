import { firecrawl } from './client'

export const scrape = async (url: string) => {
  const response = await firecrawl.scrape(url, {
    formats: ['markdown'],
    timeout: 200000,
  })

  return response.markdown!
}
