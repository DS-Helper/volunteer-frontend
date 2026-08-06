import { expect, test } from '@playwright/test';

const backendBaseUrl = (process.env.E2E_BACKEND_API_BASE_URL ?? 'https://be-test.dshelper.kr').replace(/\/$/, '');
const userToken = process.env.E2E_USER_ACCESS_TOKEN;
const adminToken = process.env.E2E_ADMIN_ACCESS_TOKEN;
const runRealBackend = process.env.E2E_RUN_REAL_BACKEND === 'true';
const mutation = process.env.E2E_ADMIN_MUTATION;
const applicationId = process.env.E2E_APPLICATION_ID;
const eventId = process.env.E2E_EVENT_ID;

const enabled = runRealBackend && Boolean(userToken && adminToken);

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function responseData(body: unknown): unknown {
  return isRecord(body) && 'data' in body ? body.data : body;
}

test.describe('실제 백엔드 봉사 API 인증 계약', () => {
  test.skip(!enabled, 'E2E_RUN_REAL_BACKEND=true 및 사용자·관리자 토큰이 필요합니다.');

  test('사용자 인증으로 내 봉사 요약을 조회한다', async ({ request }) => {
    const response = await request.get(`${backendBaseUrl}/api/v1/volunteer-members/me/summary`, {
      headers: bearer(userToken!),
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    const data = responseData(body);
    if (!isRecord(data)) throw new Error('사용자 요약 응답 data가 객체가 아닙니다.');
  });

  test('관리자 인증으로 신청 목록 페이지를 조회한다', async ({ request }) => {
    const response = await request.get(`${backendBaseUrl}/api/v1/admin/volunteer/applications?page=0&size=1`, {
      headers: bearer(adminToken!),
    });

    expect(response.ok()).toBeTruthy();
    const body: unknown = await response.json();
    const data = responseData(body);
    if (!isRecord(data)) throw new Error('관리자 신청 목록 응답 data가 객체가 아닙니다.');
    expect(Array.isArray(data.content)).toBeTruthy();
    expect(isRecord(data.page)).toBeTruthy();
  });

  test('명시적으로 선택한 관리자 mutation 계약을 검증한다', async ({ request }) => {
    test.skip(process.env.E2E_ADMIN_MUTATE !== 'true', 'E2E_ADMIN_MUTATE=true일 때만 상태 변경을 실행합니다.');

    if (mutation === 'approve' || mutation === 'reject') {
      expect(applicationId, 'E2E_APPLICATION_ID가 필요합니다.').toBeTruthy();
      const response = await request.post(
        `${backendBaseUrl}/api/v1/admin/volunteer/applications/${applicationId}/${mutation}`,
        {
          headers: { ...bearer(adminToken!), 'Content-Type': 'application/json' },
          ...(mutation === 'reject'
            ? { data: { rejectionReason: process.env.E2E_REJECTION_REASON ?? 'E2E 계약 검증용 반려' } }
            : {}),
        },
      );
      expect(response.ok()).toBeTruthy();
      expect(response.headers()['content-type']).toContain('application/json');
      const body: unknown = await response.json();
      const data = responseData(body);
      if (!isRecord(data)) throw new Error(`${mutation} 응답 data가 객체가 아닙니다.`);
      expect(data.id).toBe(applicationId);
      return;
    }

    if (mutation === 'attendance') {
      expect(eventId, 'E2E_EVENT_ID가 필요합니다.').toBeTruthy();
      const attended = (process.env.E2E_ATTENDED_PARTICIPATION_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
      const absent = (process.env.E2E_ABSENT_PARTICIPATION_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
      const response = await request.post(`${backendBaseUrl}/api/v1/admin/volunteer/events/${eventId}/attendance`, {
        headers: { ...bearer(adminToken!), 'Content-Type': 'application/json' },
        data: { attendedParticipationIds: attended, absentParticipationIds: absent },
      });
      expect(response.ok()).toBeTruthy();
      const body: unknown = await response.json();
      const data = responseData(body);
      if (!isRecord(data)) throw new Error('출석 응답 data가 객체가 아닙니다.');
      expect(data.eventId).toBe(eventId);
      expect(typeof data.attendedCount).toBe('number');
      expect(typeof data.absentCount).toBe('number');
      expect(typeof data.processedAt).toBe('string');
      return;
    }

    throw new Error('E2E_ADMIN_MUTATION은 approve, reject, attendance 중 하나여야 합니다.');
  });
});
