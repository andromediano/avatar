import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SizeLabelSelector } from './SizeLabelSelector'

describe('Feature 03: SizeLabelSelector 컴포넌트', () => {
  it('성별 선택 라디오가 렌더링된다', () => {
    render(<SizeLabelSelector onSelect={vi.fn()} />)

    expect(screen.getByLabelText('남성')).toBeInTheDocument()
    expect(screen.getByLabelText('여성')).toBeInTheDocument()
  })

  it('남성 사이즈 옵션이 렌더링된다', () => {
    render(<SizeLabelSelector onSelect={vi.fn()} />)

    expect(screen.getByText(/85.*XS/)).toBeInTheDocument()
    expect(screen.getByText(/95.*M/)).toBeInTheDocument()
    expect(screen.getByText(/100.*L/)).toBeInTheDocument()
  })

  it('사이즈 버튼 클릭 시 onSelect가 호출된다', () => {
    const onSelect = vi.fn()
    render(<SizeLabelSelector onSelect={onSelect} />)

    fireEvent.click(screen.getByText(/100.*L/))

    expect(onSelect).toHaveBeenCalledWith('M', 100)
  })

  it('여성으로 전환하면 여성 사이즈가 표시된다', () => {
    render(<SizeLabelSelector onSelect={vi.fn()} />)

    fireEvent.click(screen.getByLabelText('여성'))

    expect(screen.getByText(/80/)).toBeInTheDocument()
  })
})
