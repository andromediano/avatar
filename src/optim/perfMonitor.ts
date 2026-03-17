export interface PerfMetrics {
  frameCount: number
  avgFps: number
  drawCalls: number
  triangles: number
  isLowPerformance: boolean
}

const LOW_FPS_THRESHOLD = 30

export class PerfMonitor {
  private frameTimes: number[] = []
  private lastDrawCalls = 0
  private lastTriangles = 0

  recordFrame(
    frameDeltaMs: number,
    drawCalls: number,
    triangles: number,
  ): void {
    this.frameTimes.push(frameDeltaMs)
    this.lastDrawCalls = drawCalls
    this.lastTriangles = triangles
  }

  getMetrics(): PerfMetrics {
    const frameCount = this.frameTimes.length

    if (frameCount === 0) {
      return {
        frameCount: 0,
        avgFps: 0,
        drawCalls: 0,
        triangles: 0,
        isLowPerformance: false,
      }
    }

    const avgFrameTime =
      this.frameTimes.reduce((sum, t) => sum + t, 0) / frameCount
    const avgFps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0

    return {
      frameCount,
      avgFps,
      drawCalls: this.lastDrawCalls,
      triangles: this.lastTriangles,
      isLowPerformance: avgFps < LOW_FPS_THRESHOLD,
    }
  }

  reset(): void {
    this.frameTimes = []
    this.lastDrawCalls = 0
    this.lastTriangles = 0
  }
}
