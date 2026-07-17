import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmModal } from '@/components/modal/confirm-modal';

describe('ConfirmModal', () => {
  it('접근 가능한 대화상자를 제공하고 확인 동작을 전달한다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmModal
        open
        title="봉사 참여 신청"
        description="이 일정에 참여하시겠습니까?"
        confirmLabel="참여하기"
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('dialog', { name: '봉사 참여 신청' }),
    ).toHaveAccessibleDescription('이 일정에 참여하시겠습니까?');
    expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '참여하기' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('Escape 키로 닫고 처리 중에는 모든 닫기 동작을 차단한다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(
      <ConfirmModal
        open
        title="참여 취소"
        onConfirm={vi.fn()}
        onClose={onClose}
      />,
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();

    onClose.mockClear();
    rerender(
      <ConfirmModal
        open
        pending
        title="참여 취소"
        onConfirm={vi.fn()}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('button', { name: '닫기' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '처리 중…' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });
});
