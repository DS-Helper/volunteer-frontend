'use client'

import { useSyncExternalStore } from 'react'
import { apiClient } from '@/lib/api'

export interface CurrentUserIdentifier {
  userId: string
  userRole: string
}

export interface CurrentUserInfo {
  name: string | null
  email: string | null
  birthyear: string | null
  gender: string | null
  phoneNumber: string | null
  profileImageUrl: string | null
}

export interface UserStoreSnapshot {
  identifier: CurrentUserIdentifier | null
  info: CurrentUserInfo | null
  isLoading: boolean
  error: string | null
}

const emptySnapshot: UserStoreSnapshot = {
  identifier: null,
  info: null,
  isLoading: false,
  error: null,
}

let snapshot = emptySnapshot
const listeners = new Set<() => void>()

function emit(next: UserStoreSnapshot): void {
  snapshot = next
  listeners.forEach((listener) => listener())
}

export function getUserStoreSnapshot(): UserStoreSnapshot {
  return snapshot
}

export function subscribeUserStore(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function hydrateUserStore(): Promise<void> {
  emit({ ...snapshot, isLoading: true, error: null })
  try {
    const [identifier, info] = await Promise.all([
      apiClient.get<CurrentUserIdentifier>('/user/my-identifier', { cache: 'no-store' }),
      apiClient.get<CurrentUserInfo>('/user/my-info', { cache: 'no-store' }),
    ])
    emit({ identifier, info, isLoading: false, error: null })
  } catch (cause) {
    emit({ ...snapshot, isLoading: false, error: cause instanceof Error ? cause.message : '사용자 정보를 불러오지 못했습니다.' })
  }
}

export function clearUserStore(): void {
  emit(emptySnapshot)
}

export function useUserStore(): UserStoreSnapshot {
  return useSyncExternalStore(subscribeUserStore, getUserStoreSnapshot, () => emptySnapshot)
}
