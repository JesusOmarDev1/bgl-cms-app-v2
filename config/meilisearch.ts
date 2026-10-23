import { Meilisearch } from "meilisearch"
import { MEILISEARCH_HOST, MEILISEARCH_API_KEY } from "@/lib/env/constants"

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
