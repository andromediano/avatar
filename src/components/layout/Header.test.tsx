import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

describe('Header 컴포넌트', () => {
  it('앱 타이틀이 렌더링된다', () => {
    render(<Header />)
    expect(screen.getByText('3D Virtual Fitting')).toBeInTheDocument()
  })
})
