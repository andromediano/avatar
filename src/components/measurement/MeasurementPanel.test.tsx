import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MeasurementPanel } from './MeasurementPanel'

describe('MeasurementPanel 컴포넌트', () => {
  it('3개의 입력 모드 탭이 존재한다', () => {
    render(<MeasurementPanel />)

    expect(screen.getByText('슬라이더')).toBeInTheDocument()
    expect(screen.getByText('사이즈 선택')).toBeInTheDocument()
    expect(screen.getByText('사진 추정')).toBeInTheDocument()
  })

  it('기본 탭은 슬라이더이다', () => {
    render(<MeasurementPanel />)

    // SliderForm의 "키" 라벨이 보여야 함
    expect(screen.getByText('키')).toBeInTheDocument()
  })

  it('사이즈 선택 탭 클릭 시 사이즈 선택기가 표시된다', () => {
    render(<MeasurementPanel />)

    fireEvent.click(screen.getByText('사이즈 선택'))

    expect(screen.getByLabelText('남성')).toBeInTheDocument()
  })

  it('사진 추정 탭 클릭 시 안내 메시지가 표시된다', () => {
    render(<MeasurementPanel />)

    fireEvent.click(screen.getByText('사진 추정'))

    expect(screen.getByText(/사진을 업로드/)).toBeInTheDocument()
  })
})
