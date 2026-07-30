/** API base URL — set NEXT_PUBLIC_API_BASE_URL to override (e.g. http://localhost:8000/v1 for local backend). */
export const Base_url =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/v1'
    : 'https://apis-samsarawellness.in/v1');