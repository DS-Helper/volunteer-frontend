export interface ApiMetricSnapshot {
  requests: number
  failures: number
  totalDurationMs: number
  byStatus: Record<string, number>
}

const snapshot: ApiMetricSnapshot = { requests: 0, failures: 0, totalDurationMs: 0, byStatus: {} }

export function recordApiMetric(status: number | 'NETWORK_ERROR', durationMs: number): void {
  snapshot.requests += 1
  snapshot.totalDurationMs += durationMs
  if (status === 'NETWORK_ERROR' || status >= 400) snapshot.failures += 1
  const key = String(status)
  snapshot.byStatus[key] = (snapshot.byStatus[key] ?? 0) + 1
}

export function getApiMetricSnapshot(): ApiMetricSnapshot {
  return { ...snapshot, byStatus: { ...snapshot.byStatus } }
}
