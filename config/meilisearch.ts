import { Meilisearch } from "meilisearch"

const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY

if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
  throw new Error(
    "You must set search engine credentials in the environment variables"
  )
}

const meilisearch = new Meilisearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
  timeout: 30_000,
})

export default meilisearch
