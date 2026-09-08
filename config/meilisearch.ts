import { Meilisearch } from "meilisearch"

const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST! as string
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY! as string

if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
  throw new Error(
    "You must set search engine credentials in the environment variables"
  )
}

const meilisearch = new Meilisearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
  timeout: 30000 as number,
})

export default meilisearch
