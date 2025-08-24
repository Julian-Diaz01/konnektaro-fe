import { SWRConfiguration } from 'swr'

// Base configuration for most data
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't refetch on window focus
  revalidateOnReconnect: true, // Only refetch on reconnect
  dedupingInterval: 60000, // Dedupe requests within 1 minute
  refreshInterval: 300000, // Refresh every 5 minutes (default)
  errorRetryCount: 2, // Retry failed requests only 2 times
  errorRetryInterval: 5000, // Wait 5 seconds between retries
}

// Configuration for frequently changing data (activities, user activities)
export const swrConfigFrequent: SWRConfiguration = {
  ...swrConfig,
  // No polling; allow immediate initial fetch, then cap revalidation frequency
  refreshInterval: 0,
  dedupingInterval: 5000, // At most one request per 5 seconds per key after initial fetch
  revalidateIfStale: true, // Always revalidate stale data on mount
  revalidateOnMount: true, // Always fetch on mount
}

// Configuration for static data (events, users)
export const swrConfigStatic: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 300000, // Refresh every 5 minutes
  dedupingInterval: 120000, // Dedupe requests within 2 minutes
  revalidateOnMount: true, // Always fetch on mount
  revalidateIfStale: true, // Always revalidate stale data
  revalidateOnFocus: true, // Revalidate when window regains focus
}

// Configuration for user data - less aggressive polling
export const swrConfigUser: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 0, // No automatic polling - only fetch on mount and manual refresh
  dedupingInterval: 300000, // Dedupe requests within 5 minutes
  revalidateOnMount: true, // Always fetch on mount
  revalidateIfStale: false, // Don't automatically revalidate stale data
  errorRetryCount: 2, // Only retry 2 times
}

// Configuration for events - always fresh data
export const swrConfigEvents: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 0, // No automatic polling
  dedupingInterval: 0, // No deduplication - always fetch fresh
  revalidateOnMount: true, // Always fetch on mount
  revalidateIfStale: true, // Always revalidate stale data
  revalidateOnFocus: true, // Revalidate when window regains focus
  errorRetryCount: 2, // Only retry 2 times
  // Prevent any caching issues in production
  keepPreviousData: false, // Don't keep previous data
  revalidateOnReconnect: true, // Revalidate on reconnect
}
