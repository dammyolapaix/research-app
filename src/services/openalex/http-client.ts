export class HttpClient {
  private baseUrl: string = 'https://api.openalex.org'

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const queryParams = new URLSearchParams(params)
    console.log('queryParams', queryParams)

    let url = `${this.baseUrl}${path}`
    if (queryParams) {
      url += `?${queryParams.toString()}`
    }

    console.log(url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json() as Promise<T>
  }
}
