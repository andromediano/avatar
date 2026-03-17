import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GarmentCard } from './GarmentCard'

describe('Feature 04: GarmentCard 컴포넌트', () => {
  const garment = {
    id: 'tshirt_01',
    label: '기본 티셔츠',
    thumb: '/thumbs/tshirt.png',
  }

  it('라벨과 썸네일이 렌더링된다', () => {
    render(
      <GarmentCard
        garment={garment}
        selected={false}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('기본 티셔츠')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', '/thumbs/tshirt.png')
  })

  it('클릭 시 onSelect가 id와 함께 호출된다', () => {
    const onSelect = vi.fn()
    render(
      <GarmentCard garment={garment} selected={false} onSelect={onSelect} />,
    )

    fireEvent.click(screen.getByRole('button'))

    expect(onSelect).toHaveBeenCalledWith('tshirt_01')
  })

  it('selected일 때 선택 스타일이 적용된다', () => {
    render(
      <GarmentCard garment={garment} selected={true} onSelect={vi.fn()} />,
    )

    const btn = screen.getByRole('button')
    expect(btn.style.border).toContain('2px solid')
  })
})
