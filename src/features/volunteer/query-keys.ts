export const volunteerQueryKeys = {
  all: ['volunteer'] as const,
  events: () => ['volunteer', 'events'] as const,
  event: (eventId: string | number) => ['volunteer', 'events', String(eventId)] as const,
  participants: (eventId: string | number) => ['volunteer', 'events', String(eventId), 'participants'] as const,
  my: () => ['volunteer', 'my'] as const,
  application: () => ['volunteer', 'application'] as const,
} as const
