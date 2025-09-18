import { Works } from './entities/works'
import { HttpClient } from './http-client'

class OpenAlex {
  private readonly httpClient: HttpClient = new HttpClient()
  readonly works: Works = new Works(this.httpClient)
}

export const openAlex = new OpenAlex()
