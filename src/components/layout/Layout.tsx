import type { ReactNode } from 'react'
import { Header } from './Header'

interface Props {
  sidebar: ReactNode
  children: ReactNode
}

export function Layout({ sidebar, children }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <main style={{ flex: 1, position: 'relative' }}>{children}</main>
        {sidebar}
      </div>
    </div>
  )
}
