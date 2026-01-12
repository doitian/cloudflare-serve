import { describe, it, expect, vi } from 'vitest'
import { env } from 'cloudflare:test'
import worker from './index.js'

describe('Worker handleRequest', () => {
  describe('MIME type detection and header modification', () => {
    it('should detect and set MIME type for HTML files', async () => {
      const request = new Request('http://worker/https://example.com/page.html')

      // Mock the fetch to return a successful response
      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('<html></html>', {
            status: 200,
            statusText: 'OK',
            headers: {
              'content-type': 'text/plain',
              'content-security-policy': 'default-src none',
            },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      const response = await worker.fetch(request, env, {})

      expect(response.headers.get('content-type')).toBe('text/html')
      expect(response.headers.get('content-security-policy')).toBeNull()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'https://example.com/page.html',
        }),
      )
    })

    it('should detect and set MIME type for CSS files', async () => {
      const request = new Request('http://worker/https://example.com/style.css')

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('body {}', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      const response = await worker.fetch(request, env, {})

      expect(response.headers.get('content-type')).toBe('text/css')
    })

    it('should detect and set MIME type for JavaScript files', async () => {
      const request = new Request('http://worker/https://example.com/script.js')

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('console.log("test")', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      const response = await worker.fetch(request, env, {})

      expect(response.headers.get('content-type')).toBe('text/javascript')
    })

    it('should detect and set MIME type for PNG images', async () => {
      const request = new Request('http://worker/https://example.com/image.png')

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('binary', {
            status: 200,
            headers: { 'content-type': 'application/octet-stream' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      const response = await worker.fetch(request, env, {})

      expect(response.headers.get('content-type')).toBe('image/png')
    })

    it('should fall back to original content-type when MIME type cannot be detected', async () => {
      const request = new Request(
        'http://worker/https://example.com/file.unknown',
      )

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('data', {
            status: 200,
            headers: { 'content-type': 'application/custom' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      const response = await worker.fetch(request, env, {})

      expect(response.headers.get('content-type')).toBe('application/custom')
    })
  })

  describe('Content-Security-Policy removal', () => {
    it('should remove CSP header from proxied responses', async () => {
      const request = new Request('http://worker/https://example.com/page.html')

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('content', {
            status: 200,
            headers: {
              'content-type': 'text/html',
              'content-security-policy': "default-src 'self'",
            },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      const response = await worker.fetch(request, env, {})

      expect(response.headers.get('content-security-policy')).toBeNull()
    })
  })

  describe('URL parsing and proxying', () => {
    it('should correctly extract and fetch from target URL', async () => {
      const request = new Request(
        'http://worker/https://example.com/api/data.json',
      )

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('{"key":"value"}', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      const response = await worker.fetch(request, env, {})

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'https://example.com/api/data.json',
        }),
      )
      expect(response.status).toBe(200)
    })

    it('should preserve query parameters in proxied URL', async () => {
      const request = new Request(
        'http://worker/https://example.com/api?key=value&foo=bar',
      )

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('data', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      await worker.fetch(request, env, {})

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: '?key=value&foo=bar',
        }),
      )
    })

    it('should preserve hash fragments in proxied URL', async () => {
      const request = new Request(
        'http://worker/https://example.com/page.html#section',
      )

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('content', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      await worker.fetch(request, env, {})

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          hash: '#section',
        }),
      )
    })

    it('should handle URL-encoded origin URLs', async () => {
      const request = new Request(
        'http://worker/https%3A//raw.githubusercontent.com/tlaplus/tlaplus/3e083e3d8b0dc0202307e1496f7889f0f3cb21d7/toolbox/org.lamport.tla.toolbox.doc/html/spec/pretty-printing.html',
      )

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('<html></html>', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      await worker.fetch(request, env, {})

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'https://raw.githubusercontent.com/tlaplus/tlaplus/3e083e3d8b0dc0202307e1496f7889f0f3cb21d7/toolbox/org.lamport.tla.toolbox.doc/html/spec/pretty-printing.html',
        }),
      )
    })

    it('should handle URL-encoded URLs with special characters in path', async () => {
      const request = new Request(
        'http://worker/https%3A//example.com/path%20with%20spaces/file.html',
      )

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('content', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      await worker.fetch(request, env, {})

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'https://example.com/path%20with%20spaces/file.html',
        }),
      )
    })

    it('should NOT decode URLs that do not start with http%3A/ or https%3A/', async () => {
      const request = new Request(
        'http://worker/https://example.com/path%20with%20spaces/file.html',
      )

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('content', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      await worker.fetch(request, env, {})

      // The %20 should NOT be decoded since the URL doesn't start with http%3A/ or https%3A/
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'https://example.com/path%20with%20spaces/file.html',
        }),
      )
    })

    it('should handle http%3A/ encoded URLs', async () => {
      const request = new Request(
        'http://worker/http%3A//example.com/page.html',
      )

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('content', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      await worker.fetch(request, env, {})

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://example.com/page.html',
        }),
      )
    })
  })

  describe('Error handling', () => {
    it('should return original response when fetch fails', async () => {
      const request = new Request('http://worker/https://example.com/notfound')

      const mockFetch = vi.fn(() =>
        Promise.resolve(
          new Response('Not Found', {
            status: 404,
            statusText: 'Not Found',
            headers: { 'content-type': 'text/plain' },
          }),
        ),
      )
      vi.stubGlobal('fetch', mockFetch)

      const response = await worker.fetch(request, env, {})

      expect(response.status).toBe(404)
      expect(response.statusText).toBe('Not Found')
    })
  })
})
