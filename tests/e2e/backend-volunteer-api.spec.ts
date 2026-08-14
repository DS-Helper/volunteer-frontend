import { expect, test, type APIRequestContext } from '@playwright/test';

const backendBaseUrl = (process.env.E2E_BACKEND_API_BASE_URL ?? 'https://be-test.dshelper.kr').replace(/\/$/, '');
const adminBaseUrl = (process.env.E2E_ADMIN_API_BASE_URL ?? backendBaseUrl).replace(/\/$/, '');
const userToken = process.env.E2E_USER_ACCESS_TOKEN;
const configuredAdminToken = process.env.E2E_ADMIN_ACCESS_TOKEN;
const adminTokenUrl = process.env.E2E_ADMIN_TOKEN_URL ?? `${backendBaseUrl}/test/temp-token`;
const runRealBackend = process.env.E2E_RUN_REAL_BACKEND === 'true';
const mutation = process.env.E2E_ADMIN_MUTATION;
const applicationId = process.env.E2E_APPLICATION_ID;
const eventId = process.env.E2E_EVENT_ID;
const autoSelectTarget = process.env.E2E_AUTO_SELECT_TARGET === 'true';

const userEnabled = runRealBackend && Boolean(userToken);
const adminEnabled = runRealBackend && Boolean(configuredAdminToken || process.env.E2E_FETCH_ADMIN_TOKEN !== 'false');
let fetchedAdminToken: string | undefined;

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function responseData(body: unknown): unknown {
  return isRecord(body) && 'data' in body ? body.data : body;
}

async function getAdminToken(request: APIRequestContext): Promise<string> {
  if (configuredAdminToken) return configuredAdminToken;
  if (fetchedAdminToken) return fetchedAdminToken;
  const response = await request.get(adminTokenUrl);
  expect(response.ok(), `임시 관리자 토큰 API ${response.status()} 응답`).toBeTruthy();
  const body: unknown = await response.json();
  const data = responseData(body);
  const token = isRecord(body) && typeof body.accessToken === 'string'
    ? body.accessToken
    : isRecord(data) && typeof data.accessToken === 'string'
      ? data.accessToken
      : undefined;
  if (!token) throw new Error('임시 관리자 토큰 응답에 accessToken이 없습니다.');
  fetchedAdminToken = token;
  return token;
}

async function findPendingApplicationId(request: APIRequestContext) {
  const response = await request.get(`${adminBaseUrl}/api/v1/admin/volunteer/applications?status=PENDING&page=0&size=1`, {
    headers: bearer(await getAdminToken(request)),
  });
  expect(response.ok()).toBeTruthy();
  const data = responseData(await response.json());
  if (!isRecord(data) || !Array.isArray(data.content) || !isRecord(data.content[0])) {
    throw new Error('PENDING 신청을 자동 선택할 수 없습니다.');
  }
  const id = data.content[0].id;
  if (typeof id !== 'string') throw new Error('신청 응답의 id가 없습니다.');
  return id;
}

async function findEventId(request: APIRequestContext): Promise<string> {
  const response = await request.get(`${adminBaseUrl}/api/v1/admin/volunteer/events?page=0&size=1`, {
    headers: bearer(await getAdminToken(request)),
  });
  expect(response.ok()).toBeTruthy();
  const data = responseData(await response.json());
  if (!isRecord(data) || !Array.isArray(data.content) || !isRecord(data.content[0])) {
    throw new Error('일정을 자동 선택할 수 없습니다.');
  }
  const id = data.content[0].id;
  if (typeof id !== 'string') throw new Error('일정 응답의 id가 없습니다.');
  return id;
}

async function findParticipationIds(request: APIRequestContext, targetEventId: string): Promise<string[]> {
  const response = await request.get(`${adminBaseUrl}/api/v1/admin/volunteer/events/${targetEventId}/participations`, {
    headers: bearer(await getAdminToken(request)),
  });
  expect(response.ok()).toBeTruthy();
  const data = responseData(await response.json());
  if (!isRecord(data) || !Array.isArray(data.participations)) throw new Error('참여자 목록을 자동 선택할 수 없습니다.');
  const id = data.participations.find((item): item is Record<string, unknown> => isRecord(item) && typeof item.participationId === 'string')?.participationId;
  if (!id) throw new Error('출석 처리할 참여자가 없습니다.');
  return [String(id)];
}

test.describe('실제 백엔드 봉사 API 인증 계약', () => {
  test('사용자 인증으로 내 봉사 요약을 조회한다', async ({ request }) => {
    test.skip(!userEnabled, 'E2E_RUN_REAL_BACKEND=true 및 사용자 토큰이 필요합니다.');
    const response = await request.get(`${backendBaseUrl}/api/v1/volunteer-members/me/summary`, {
      headers: bearer(userToken!),
    });

    expect(response.ok(), `사용자 API ${response.status()} 응답: ${(await response.text()).slice(0, 300)}`).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');
    const body: unknown = await response.json();
    const data = responseData(body);
    if (!isRecord(data)) throw new Error('사용자 요약 응답 data가 객체가 아닙니다.');
  });

  test('관리자 인증으로 신청 목록 페이지를 조회한다', async ({ request }) => {
    test.skip(!adminEnabled, 'E2E_RUN_REAL_BACKEND=true 및 관리자 토큰이 필요합니다.');
    const response = await request.get(`${adminBaseUrl}/api/v1/admin/volunteer/applications?page=0&size=1`, {
      headers: bearer(await getAdminToken(request)),
    });

    expect(response.ok(), `관리자 API ${response.status()} 응답: ${(await response.text()).slice(0, 300)}`).toBeTruthy();
    const body: unknown = await response.json();
    const data = responseData(body);
    if (!isRecord(data)) throw new Error('관리자 신청 목록 응답 data가 객체가 아닙니다.');
    expect(Array.isArray(data.content)).toBeTruthy();
    expect(isRecord(data.page)).toBeTruthy();
  });

  test('명시적으로 선택한 관리자 mutation 계약을 검증한다', async ({ request }) => {
    test.skip(!adminEnabled, 'E2E_RUN_REAL_BACKEND=true 및 관리자 토큰이 필요합니다.');
    test.skip(process.env.E2E_ADMIN_MUTATE !== 'true', 'E2E_ADMIN_MUTATE=true일 때만 상태 변경을 실행합니다.');

    if (mutation === 'approve' || mutation === 'reject') {
      const targetApplicationId = applicationId ?? (autoSelectTarget ? await findPendingApplicationId(request) : undefined);
      expect(targetApplicationId, 'E2E_APPLICATION_ID 또는 E2E_AUTO_SELECT_TARGET=true가 필요합니다.').toBeTruthy();
      const response = await request.post(
        `${adminBaseUrl}/api/v1/admin/volunteer/applications/${targetApplicationId}/${mutation}`,
        {
          headers: { ...bearer(await getAdminToken(request)), 'Content-Type': 'application/json' },
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
      expect(data.id).toBe(targetApplicationId);
      return;
    }

    if (mutation === 'attendance') {
      const targetEventId: string | undefined = eventId ?? (autoSelectTarget ? await findEventId(request) : undefined);
      if (!targetEventId) throw new Error('E2E_EVENT_ID 또는 E2E_AUTO_SELECT_TARGET=true가 필요합니다.');
      const attended = (process.env.E2E_ATTENDED_PARTICIPATION_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
      const absent = (process.env.E2E_ABSENT_PARTICIPATION_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
      if (autoSelectTarget && attended.length + absent.length === 0) attended.push(...await findParticipationIds(request, targetEventId));
      expect(attended.length + absent.length).toBeGreaterThan(0);
      const response = await request.post(`${adminBaseUrl}/api/v1/admin/volunteer/events/${targetEventId}/attendance`, {
        headers: { ...bearer(await getAdminToken(request)), 'Content-Type': 'application/json' },
        data: { attendedParticipationIds: attended, absentParticipationIds: absent },
      });
      expect(response.ok()).toBeTruthy();
      const body: unknown = await response.json();
      const data = responseData(body);
      if (!isRecord(data)) throw new Error('출석 응답 data가 객체가 아닙니다.');
      expect(data.eventId).toBe(targetEventId);
      expect(typeof data.attendedCount).toBe('number');
      expect(typeof data.absentCount).toBe('number');
      expect(typeof data.processedAt).toBe('string');
      return;
    }

    throw new Error('E2E_ADMIN_MUTATION은 approve, reject, attendance 중 하나여야 합니다.');
  });
});
