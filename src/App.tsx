import { Layout } from './components/layout/Layout'
import { SidePanel } from './components/layout/SidePanel'
import { Canvas3D } from './scene/Canvas3D'

export default function App() {
  return (
    <Layout sidebar={<SidePanel />}>
      <Canvas3D />
    </Layout>
  )
}
