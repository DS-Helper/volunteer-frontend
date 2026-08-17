import type { Prisma } from '@prisma/client'

type AdminApplicationRecord = Prisma.VolunteerApplicationGetPayload<{ select: {
  id: true; userId: true; name: true; phone: true; birthDate: true; gender: true; neighborhood: true;
  preferredActivities: true; motivation: true; status: true; rejectionReason: true; adminMemo: true;
  reviewedBy: true; reviewedAt: true; createdAt: true; updatedAt: true;
} }>

export function mapAdminApplication(application: AdminApplicationRecord) {
  return {
    id: application.id, userId: application.userId, name: application.name, phone: application.phone, birthDate: application.birthDate,
    gender: application.gender, neighborhood: application.neighborhood, preferredActivities: application.preferredActivities,
    motivation: application.motivation, status: application.status, rejectionReason: application.rejectionReason, adminMemo: application.adminMemo,
    reviewedBy: application.reviewedBy, reviewedAt: application.reviewedAt, createdAt: application.createdAt, updatedAt: application.updatedAt,
    capabilities: { canApprove: application.status === 'PENDING', canReject: application.status === 'PENDING' },
  }
}
