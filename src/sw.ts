/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare let self: ServiceWorkerGlobalScope

// 앱 셸 프리캐싱
precacheAndRoute(self.__WB_MANIFEST)

// 3D 에셋 — Cache-first (최대 200개, 30일)
registerRoute(
  ({ url }) => /\.(glb|gltf|ktx2|hdr)$/.test(url.pathname),
  new CacheFirst({
    cacheName: '3d-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
)

// 이미지 에셋 — Cache-first
registerRoute(
  ({ url }) => /\.(png|jpg|jpeg|webp|svg)$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
)

// API — Network-first
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-cache' }),
)
