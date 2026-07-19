'use client'

import { isApiError } from '@/lib/errors'

export function apiErrorMessage(error: unknown): string {
  if (!isApiError(error)) return '네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.'
  if (error.status === 401 || error.code === 'UNAUTHORIZED') return '로그인이 필요합니다.'
  if (error.status === 403 || error.code === 'FORBIDDEN') return '이 작업을 수행할 권한이 없습니다.'
  if (error.status === 404 || error.code === 'NOT_FOUND') return '요청한 정보를 찾을 수 없습니다.'
  if (error.status === 409 || error.code === 'CONFLICT') return '현재 상태가 변경되어 작업을 완료하지 못했습니다.'
  if (error.status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  return error.message || '요청을 처리하지 못했습니다.'
}

export function ApiErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (isApiError(error) && (error.status === 403 || error.code === 'FORBIDDEN')) {
    return <div className="rounded-2xl border border-[#ead8ad] bg-[#fffaf0] p-8 text-center" role="alert">
      <p className="text-lg font-extrabold text-[#7b5600]">관리자 권한이 필요합니다.</p>
      <p className="mt-2 text-sm text-[#8a6d2f]">이 기능을 사용할 수 있는 권한이 없습니다. 관리자 계정으로 다시 로그인해 주세요.</p>
      <a href="/login" className="mt-5 inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">로그인 페이지</a>
    </div>
  }
  return <div className="rounded-2xl border border-[#f0cccc] bg-[#fff7f7] p-6 text-center" role="alert">
    <p className="text-sm font-semibold text-[#a33]">{apiErrorMessage(error)}</p>
    {onRetry ? <button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">다시 시도</button> : null}
  </div>
}
