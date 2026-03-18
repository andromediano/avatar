import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GarmentCatalog } from './GarmentCatalog'

const GARMENTS = [
  { id: 'tshirt', label: '기본 티셔츠', thumb: '/thumbs/tshirt.png' },
  { id: 'hoodie', label: '집업 후디', thumb: '/thumbs/hoodie.png' },
  { id: 'pants', label: '슬림 팬츠', thumb: '/thumbs/pants.png' },
]

describe('Feature 04: GarmentCatalog 컴포넌트', () => {
  it('의류 카드들이 렌더링된다', () => {
    render(
      <GarmentCatalog
        garments={GARMENTS}
        selected="tshirt"
        onSelect={vi.fn()}
      />,
    )

    expect(screen.getByText('기본 티셔츠')).toBeInTheDocument()
    expect(screen.getByText('집업 후디')).toBeInTheDocument()
    expect(screen.getByText('슬림 팬츠')).toBeInTheDocument()
  })

  it('카드 클릭 시 onSelect가 호출된다', () => {
    const onSelect = vi.fn()
    render(
      <GarmentCatalog
        garments={GARMENTS}
        selected="tshirt"
        onSelect={onSelect}
      />,
    )

    fireEvent.click(screen.getByText('집업 후디'))
    expect(onSelect).toHaveBeenCalledWith('hoodie')
  })

  it('빈 목록일 때 안내 메시지가 표시된다', () => {
    render(
      <GarmentCatalog garments={[]} selected="" onSelect={vi.fn()} />,
    )

    expect(screen.getByText('등록된 의류가 없습니다')).toBeInTheDocument()
  })
})
