export const ClientBranchEnum = [
  "steel",
  "construction",
  "laboratory",
  "agricultural",
  "livestock",
  "fishing",
  "automotive",
  "electronics",
  "plastics",
] as const
export type ClientBranch = (typeof ClientBranchEnum)[number]
