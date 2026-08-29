import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import {
  defaultShouldDehydrateQuery,
  QueryClient,
  type DehydratedState,
  type QueryKey,
} from "@tanstack/react-query"

type HydratedQuery = {
  queryKey: QueryKey
  data: unknown
}

type HydrationOptions = {
  tags: string[]
}

async function getHydrationUpdatedAt(tags: string[]) {
  "use cache"
  cacheTag(...tags)
  cacheLife("max")
  return Date.now()
}

export async function dehydrate(
  queries: HydratedQuery[],
  options: HydrationOptions
): Promise<DehydratedState> {
  const updatedAt = await getHydrationUpdatedAt(options.tags)

  const queryClient = new QueryClient()

  for (const query of queries) {
    queryClient.setQueryData(query.queryKey, query.data, { updatedAt })
  }

  const dehydratedQueries = []

  for (const query of queryClient.getQueryCache().getAll()) {
    if (!defaultShouldDehydrateQuery(query)) continue

    dehydratedQueries.push({
      dehydratedAt: updatedAt,
      queryHash: query.queryHash,
      queryKey: query.queryKey,
      state: query.state,
      ...(query.meta ? { meta: query.meta } : {}),
    })
  }

  return {
    mutations: [],
    queries: dehydratedQueries,
  }
}
