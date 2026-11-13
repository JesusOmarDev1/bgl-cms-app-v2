/**
 * Official Directus API error shapes.
 * https://directus.com/docs/guides/connect/errors
 */
export interface DirectusError {
  message: string
  extensions: {
    code: string
    [key: string]: unknown
  }
}

/** A response body can carry more than one error; branch on `errors[0]` first. */
export interface DirectusErrorResponse {
  errors: DirectusError[]
}
