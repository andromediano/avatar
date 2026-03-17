import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock WebGL/WebGPU context for Three.js
const mockCanvas = {
  getContext: vi.fn(() => ({
    canvas: { width: 800, height: 600 },
    drawingBufferWidth: 800,
    drawingBufferHeight: 600,
    getExtension: vi.fn(),
    getParameter: vi.fn(() => []),
    createShader: vi.fn(),
    createProgram: vi.fn(),
    createBuffer: vi.fn(),
    createFramebuffer: vi.fn(),
    createRenderbuffer: vi.fn(),
    createTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindFramebuffer: vi.fn(),
    bindRenderbuffer: vi.fn(),
    bindTexture: vi.fn(),
    blendFunc: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    clearDepth: vi.fn(),
    clearStencil: vi.fn(),
    colorMask: vi.fn(),
    compileShader: vi.fn(),
    depthFunc: vi.fn(),
    depthMask: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    frontFace: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    getProgramParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => ''),
    getProgramInfoLog: vi.fn(() => ''),
    getAttribLocation: vi.fn(),
    getUniformLocation: vi.fn(),
    linkProgram: vi.fn(),
    pixelStorei: vi.fn(),
    scissor: vi.fn(),
    shaderSource: vi.fn(),
    useProgram: vi.fn(),
    viewport: vi.fn(),
    attachShader: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    activeTexture: vi.fn(),
    uniform1i: vi.fn(),
    uniform1f: vi.fn(),
    texParameteri: vi.fn(),
    texImage2D: vi.fn(),
    bufferData: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    generateMipmap: vi.fn(),
    deleteShader: vi.fn(),
    deleteProgram: vi.fn(),
    deleteBuffer: vi.fn(),
    deleteTexture: vi.fn(),
    stencilFunc: vi.fn(),
    stencilOp: vi.fn(),
    stencilMask: vi.fn(),
    blendEquation: vi.fn(),
    blendFuncSeparate: vi.fn(),
    blendEquationSeparate: vi.fn(),
    cullFace: vi.fn(),
    lineWidth: vi.fn(),
    polygonOffset: vi.fn(),
    sampleCoverage: vi.fn(),
    isContextLost: vi.fn(() => false),
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    HIGH_FLOAT: 36338,
    MEDIUM_FLOAT: 36337,
    MAX_TEXTURE_SIZE: 3379,
    MAX_VERTEX_ATTRIBS: 34921,
  })),
  width: 800,
  height: 600,
  clientWidth: 800,
  clientHeight: 600,
  style: {},
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  toDataURL: vi.fn(() => 'data:image/png;base64,'),
}

vi.stubGlobal('HTMLCanvasElement', class {
  getContext = mockCanvas.getContext
  width = 800
  height = 600
  clientWidth = 800
  clientHeight = 600
  style = {}
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  toDataURL = vi.fn(() => 'data:image/png;base64,')
})

// Mock requestAnimationFrame
vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => {
  return setTimeout(() => cb(performance.now()), 0) as unknown as number
}))
vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => clearTimeout(id)))

// Mock ResizeObserver
vi.stubGlobal('ResizeObserver', class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
})
