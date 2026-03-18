import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FittingHistory } from './FittingHistory'

const RECORDS = [
  {
    id: 'fit_01',
    garmentName: '기본 티셔츠',
    timestamp: Date.now() - 3600000,
    thumbnail: undefined,
  },
  {
    id: 'fit_02',
    garmentName: '집업 후디',
    timestamp: Date.now(),
    thumbnail: undefined,
  },
]

describe('Feature 08: FittingHistory 컴포넌트', () => {
  it('피팅 기록이 렌더링된다', () => {
    render(
      <FittingHistory
        records={RECORDS}
        onRestore={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('기본 티셔츠')).toBeInTheDocument()
    expect(screen.getByText('집업 후디')).toBeInTheDocument()
  })

  it('기록 없을 때 안내 메시지가 표시된다', () => {
    render(
      <FittingHistory records={[]} onRestore={vi.fn()} onDelete={vi.fn()} />,
    )

    expect(
      screen.getByText('저장된 피팅 기록이 없습니다'),
    ).toBeInTheDocument()
  })

  it('복원 버튼 클릭 시 onRestore가 호출된다', () => {
    const onRestore = vi.fn()
    render(
      <FittingHistory
        records={RECORDS}
        onRestore={onRestore}
        onDelete={vi.fn()}
      />,
    )

    const restoreButtons = screen.getAllByText('복원')
    fireEvent.click(restoreButtons[0])

    expect(onRestore).toHaveBeenCalledWith('fit_01')
  })

  it('삭제 버튼 클릭 시 onDelete가 호출된다', () => {
    const onDelete = vi.fn()
    render(
      <FittingHistory
        records={RECORDS}
        onRestore={vi.fn()}
        onDelete={onDelete}
      />,
    )

    const deleteButtons = screen.getAllByText('삭제')
    fireEvent.click(deleteButtons[0])

    expect(onDelete).toHaveBeenCalledWith('fit_01')
  })
})
