import type { PageResponse } from '@/lib/api'

import type {
  IsoDateString,
  IsoDateTimeString,
  VolunteerId,
  VolunteerOption,
  VolunteerPageQuery,
} from './common'
import type {
  VolunteerApplicationStatus,
  VolunteerEventCloseReason,
  VolunteerEventStatus,
  VolunteerEventVisibility,
  VolunteerGender,
  VolunteerMemberStatus,
  VolunteerParticipationStatus,
} from './status'

export interface VolunteerApplicationCapabilities {
  canEdit: boolean
  canCancel: boolean
  canReapply: boolean
}

export interface VolunteerEventCapabilities {
  canApply: boolean
  canCancel: boolean
  canViewParticipants: boolean
}

export interface AdminVolunteerApplicationCapabilities {
  canApprove: boolean
  canReject: boolean
}

export interface AdminVolunteerMemberCapabilities {
  canActivate: boolean
  canSuspend: boolean
  canWithdraw: boolean
}

export interface AdminVolunteerEventCapabilities {
  canEdit: boolean
  canOpen: boolean
  canClose: boolean
  canCancel: boolean
  canManageAttendance: boolean
}

export interface VolunteerIntroductionCapabilities {
  canApply: boolean
  canViewApplicationStatus: boolean
  canViewEvents: boolean
}

export interface VolunteerIntroduction {
  title: string
  description: string
  activities?: string[]
  regions?: string[]
  eligibilityRequirements?: string[]
  loggedIn?: boolean
  /** 이전 mock fixture 호환을 위해 유지하며 BE 실응답에는 없다. */
  summary?: string
  heroImageUrl?: string | null
  activityFields?: VolunteerOption[]
  activityRegions?: string[]
  eligibility?: string[]
  applicationStatus: VolunteerApplicationStatus | null
  capabilities: VolunteerIntroductionCapabilities
}

export interface VolunteerApplicationInput {
  name: string
  phone: string
  birthDate: IsoDateString
  gender: VolunteerGender
  neighborhood: string
  preferredActivities: string[]
  motivation: string
}

export interface CreateVolunteerApplicationRequest {
  application: VolunteerApplicationInput
  photo: File
}

export interface UpdateVolunteerApplicationRequest {
  application: VolunteerApplicationInput
  photo?: File
}

export interface VolunteerApplication {
  id: VolunteerId
  name: string
  phone: string
  birthDate: IsoDateString
  gender: VolunteerGender
  neighborhood: string
  preferredActivities: string[]
  motivation: string
  status: VolunteerApplicationStatus
  rejectionReason: string | null
  createdAt: IsoDateTimeString
  updatedAt: IsoDateTimeString
  reviewedAt: IsoDateTimeString | null
  capabilities: VolunteerApplicationCapabilities
}

export interface VolunteerEventQuery extends VolunteerPageQuery {
  status?: VolunteerEventStatus
}

export interface VolunteerEventListItem {
  id: VolunteerId
  title: string
  type: string
  typeLabel: string
  imageUrl: string | null
  startAt: IsoDateTimeString
  endAt: IsoDateTimeString
  recruitmentDeadlineAt: IsoDateTimeString
  location: string
  capacity: number
  participantCount: number
  status: VolunteerEventStatus
  closeReason: VolunteerEventCloseReason | null
  myParticipationStatus: VolunteerParticipationStatus | null
  capabilities: VolunteerEventCapabilities
}

export interface VolunteerEventDetail extends VolunteerEventListItem {
  description: string
  supplies: string[]
  precautions: string[]
  createdAt: IsoDateTimeString
  updatedAt: IsoDateTimeString
}

export interface MaskedVolunteerParticipant {
  maskedName: string
}

export interface VolunteerEventParticipants {
  participants: MaskedVolunteerParticipant[]
}

export interface VolunteerParticipation {
  id: VolunteerId
  eventId: VolunteerId
  status: VolunteerParticipationStatus
  appliedAt: IsoDateTimeString
  canceledAt: IsoDateTimeString | null
}

export interface MyUpcomingVolunteerEvent extends VolunteerEventListItem {
  participationId: VolunteerId
}

export interface MyCompletedVolunteerEvent extends VolunteerEventListItem {
  participationId: VolunteerId
  recognizedHours: number
}

export interface MyVolunteerSummary {
  totalParticipationCount: number
  totalHours: number
}

export interface AdminVolunteerApplicationQuery extends VolunteerPageQuery {
  name?: string
  phone?: string
  status?: VolunteerApplicationStatus
  appliedFrom?: IsoDateString
  appliedTo?: IsoDateString
}

export interface AdminVolunteerApplication
  extends Omit<VolunteerApplication, 'capabilities'> {
  id: string | number
  userId: string | number
  photoUrl?: string | null
  adminMemo: string | null
  reviewedBy: VolunteerId | null
  capabilities: AdminVolunteerApplicationCapabilities
}

export interface RejectVolunteerApplicationRequest {
  rejectionReason: string
  adminMemo?: string
}

export interface AdminVolunteerMemberQuery extends VolunteerPageQuery {
  keyword?: string
  status?: VolunteerMemberStatus
  gender?: VolunteerGender
}

export interface AdminVolunteerMemberListItem {
  id: string | number
  userId: string | number
  name: string
  gender: VolunteerGender
  phone: string
  joinedAt: IsoDateTimeString
  status: VolunteerMemberStatus
  totalParticipationCount: number
  totalHours: number
  capabilities: AdminVolunteerMemberCapabilities
}

export interface VolunteerMemberParticipationHistoryItem {
  participationId: string | number
  eventId: string | number
  title: string
  startAt: IsoDateTimeString
  endAt: IsoDateTimeString
  location: string
  status: VolunteerParticipationStatus
  recognizedHours: number | null
}

export interface VolunteerMemberStatusHistoryItem {
  id: string | number
  previousStatus: VolunteerMemberStatus | null
  nextStatus: VolunteerMemberStatus
  reason: string | null
  changedBy: string | number
  changedAt: IsoDateTimeString
}

export interface AdminVolunteerMemberDetail
  extends AdminVolunteerMemberListItem {
  application: AdminVolunteerApplication
  upcomingEvents: VolunteerMemberParticipationHistoryItem[]
  attendanceHistory: VolunteerMemberParticipationHistoryItem[]
  absenceHistory: VolunteerMemberParticipationHistoryItem[]
  cancellationHistory: VolunteerMemberParticipationHistoryItem[]
  adminMemo: string | null
  statusHistory: VolunteerMemberStatusHistoryItem[]
}

export interface ChangeVolunteerMemberStatusRequest {
  reason: string
}

export interface AdminVolunteerEventQuery extends VolunteerPageQuery {
  keyword?: string
  status?: VolunteerEventStatus
  visibility?: VolunteerEventVisibility
}

export interface VolunteerEventInput {
  title: string
  type: string
  imageFileId: string
  startAt: IsoDateTimeString
  endAt: IsoDateTimeString
  recruitmentDeadlineAt: IsoDateTimeString
  location: string
  capacity: number
  description: string
  supplies: string | null
  precautions: string | null
  status: VolunteerEventStatus
  visibility: VolunteerEventVisibility
}

export type CreateVolunteerEventRequest = VolunteerEventInput

export type UpdateVolunteerEventRequest = VolunteerEventInput

export interface AdminVolunteerEventImageUploadResponse {
  volunteerFileId: string
  s3Key: string
  url: string
  contentType: string
  width: number
  height: number
}

export interface AdminVolunteerEvent
  extends Omit<VolunteerEventDetail, 'capabilities'> {
  id: string | number
  // Admin API의 UUID 전환 기간에 Mock 숫자 ID를 함께 허용한다.
  imageFileId?: string
  visibility: VolunteerEventVisibility
  cancelReason: string | null
  createdBy: string | number
  updatedBy: string | number
  capabilities: VolunteerEventCapabilities & AdminVolunteerEventCapabilities
}

export interface CloseVolunteerEventRequest {
  reason?: string
}

export interface CancelVolunteerEventRequest {
  reason: string
}

export interface AdminVolunteerParticipationItem {
  participationId: string | number
  memberId: string | number
  name: string
  phone: string
  participationStatus: VolunteerParticipationStatus
  appliedAt: IsoDateTimeString
  attendanceCheckedAt: IsoDateTimeString | null
}

export interface AdminVolunteerEventParticipations {
  event: AdminVolunteerEvent
  participations: AdminVolunteerParticipationItem[]
}

export interface SaveVolunteerAttendanceRequest {
  attendedParticipationIds: Array<string | number>
  absentParticipationIds: Array<string | number>
}

export interface SaveVolunteerAttendanceResponse {
  eventId: string | number
  attendedCount: number
  absentCount: number
  processedAt: IsoDateTimeString
}

export type VolunteerEventPage = PageResponse<VolunteerEventListItem>
export type AdminVolunteerApplicationPage =
  PageResponse<AdminVolunteerApplication>
export type AdminVolunteerMemberPage =
  PageResponse<AdminVolunteerMemberListItem>
export type AdminVolunteerEventPage = PageResponse<AdminVolunteerEvent>
