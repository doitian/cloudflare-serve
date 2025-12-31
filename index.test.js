import { describe, it, expect, vi, beforeEach } from 'vitest'
import mime from 'mime/lite'

describe('MIME type detection', () => {
  describe('mime/lite library', () => {
    it('should detect HTML MIME type', () => {
      expect(mime.getType('/index.html')).toBe('text/html')
    })

    it('should detect PNG MIME type', () => {
      expect(mime.getType('/image.png')).toBe('image/png')
    })

    it('should detect JPEG MIME type for .jpg', () => {
      expect(mime.getType('/photo.jpg')).toBe('image/jpeg')
    })

    it('should detect JPEG MIME type for .jpeg', () => {
      expect(mime.getType('/photo.jpeg')).toBe('image/jpeg')
    })

    it('should detect CSS MIME type', () => {
      expect(mime.getType('/style.css')).toBe('text/css')
    })

    it('should detect JavaScript MIME type', () => {
      expect(mime.getType('/script.js')).toBe('text/javascript')
    })

    it('should detect SVG MIME type', () => {
      expect(mime.getType('/icon.svg')).toBe('image/svg+xml')
    })

    it('should detect GIF MIME type', () => {
      expect(mime.getType('/animation.gif')).toBe('image/gif')
    })

    it('should detect JSON MIME type', () => {
      expect(mime.getType('/data.json')).toBe('application/json')
    })

    it('should detect PDF MIME type', () => {
      expect(mime.getType('/document.pdf')).toBe('application/pdf')
    })

    it('should return null for unknown extensions', () => {
      expect(mime.getType('/file.unknown')).toBeNull()
    })
  })

  describe('pathname extraction', () => {
    it('should work with simple paths', () => {
      const url = new URL('https://example.com/image.png')
      expect(mime.getType(url.pathname)).toBe('image/png')
    })

    it('should work with nested paths', () => {
      const url = new URL('https://example.com/path/to/file.css')
      expect(mime.getType(url.pathname)).toBe('text/css')
    })

    it('should work with query parameters', () => {
      const url = new URL('https://example.com/script.js?v=1.0')
      expect(mime.getType(url.pathname)).toBe('text/javascript')
    })

    it('should work with hash fragments', () => {
      const url = new URL('https://example.com/page.html#section')
      expect(mime.getType(url.pathname)).toBe('text/html')
    })
  })
})
