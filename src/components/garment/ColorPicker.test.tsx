import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorPicker } from './ColorPicker'

describe('Feature 05: ColorPicker 컴포넌트', () => {
  it('7개의 프리셋 색상 버튼이 렌더링된다', () => {
    render(<ColorPicker color="#3b82f6" onChange={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(7)
  })

  it('프리셋 클릭 시 onChange가 해당 색상으로 호출된다', () => {
    const onChange = vi.fn()
    render(<ColorPicker color="#3b82f6" onChange={onChange} />)

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1]) // #ef4444

    expect(onChange).toHaveBeenCalledWith('#ef4444')
  })

  it('커스텀 color input이 존재한다', () => {
    render(<ColorPicker color="#3b82f6" onChange={vi.fn()} />)

    const colorInput = document.querySelector('input[type="color"]')
    expect(colorInput).toBeInTheDocument()
  })

  it('현재 선택된 색상의 버튼에 선택 스타일이 적용된다', () => {
    render(<ColorPicker color="#ef4444" onChange={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    // #ef4444는 두 번째 프리셋
    expect(buttons[1].style.border).toContain('3px solid')
  })
})
