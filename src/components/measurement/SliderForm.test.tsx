import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SliderForm } from './SliderForm'
import type { BodyMeasurements } from '../../store/sceneStore'

const DEFAULT: BodyMeasurements = {
  height: 0.5,
  chest: 0.5,
  waist: 0.5,
  hip: 0.5,
  shoulder: 0.5,
  armLength: 0.5,
  legLength: 0.5,
  weight: 0.5,
}

describe('Feature 03: SliderForm 컴포넌트', () => {
  it('모든 체형 슬라이더가 렌더링된다', () => {
    render(<SliderForm values={DEFAULT} onChange={vi.fn()} />)

    expect(screen.getByText('키')).toBeInTheDocument()
    expect(screen.getByText('가슴둘레')).toBeInTheDocument()
    expect(screen.getByText('허리둘레')).toBeInTheDocument()
    expect(screen.getByText('엉덩이둘레')).toBeInTheDocument()
    expect(screen.getByText('체중')).toBeInTheDocument()
  })

  it('슬라이더 조작 시 onChange가 호출된다', () => {
    const onChange = vi.fn()
    render(<SliderForm values={DEFAULT} onChange={onChange} />)

    const sliders = screen.getAllByRole('slider')
    fireEvent.change(sliders[0], { target: { value: '0.7' } })

    expect(onChange).toHaveBeenCalled()
  })

  it('슬라이더의 min=0, max=1, step=0.01이다', () => {
    render(<SliderForm values={DEFAULT} onChange={vi.fn()} />)

    const sliders = screen.getAllByRole('slider')
    const first = sliders[0]

    expect(first).toHaveAttribute('min', '0')
    expect(first).toHaveAttribute('max', '1')
    expect(first).toHaveAttribute('step', '0.01')
  })
})
