import { Meilisearch } from "meilisearch"

const meilisearch = new Meilisearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST! as string,
  apiKey: process.env.MEILISEARCH_API_KEY! as string,
})

export default meilisearch
