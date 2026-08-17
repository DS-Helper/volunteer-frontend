'use client'

import { useSyncExternalStore } from 'react'

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
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem('localAuthUser')
    if (!raw) return emit(emptySnapshot)
    const user = JSON.parse(raw) as { id: string; username: string; role: 'USER' | 'ADMIN' }
    setLocalAuthUser(user)
  } catch {
    emit({ ...emptySnapshot, error: '사용자 정보를 불러오지 못했습니다.' })
  }
}

export function clearUserStore(): void {
  emit(emptySnapshot)
}

export function setLocalAuthUser(user: { id: string; username: string; role: 'USER' | 'ADMIN' }): void {
  window.localStorage.setItem('localAuthUser', JSON.stringify(user))
  emit({
    identifier: { userId: user.id, userRole: user.role },
    info: { name: user.username, email: null, birthyear: null, gender: null, phoneNumber: null, profileImageUrl: null },
    isLoading: false,
    error: null,
  })
}

export function useUserStore(): UserStoreSnapshot {
  return useSyncExternalStore(subscribeUserStore, getUserStoreSnapshot, () => emptySnapshot)
}
