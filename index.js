import mime from 'mime/lite'

/**
 * Handle incoming request
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = new URL(request.url)

  const pathname = url.pathname.substring(1)
  const shouldDecode =
    pathname.startsWith('https%3A//') || pathname.startsWith('http%3A//')

  let originURL
  if (shouldDecode) {
    // For decoded URLs, use search and hash from the decoded pathname
    originURL = new URL(decodeURIComponent(pathname))
  } else {
    // For non-decoded URLs, parse as before and use worker request's search/hash
    const baseOriginURL = pathname.split(/:\/\/?/, 2).join('://')
    originURL = new URL([baseOriginURL, url.search, url.hash].join(''))
  }
  console.log(originURL)

  const originResponse = await fetch(originURL)
  if (originResponse.ok) {
    let headers = new Headers(originResponse.headers)
    const detectedMime = mime.getType(originURL.pathname)
    headers.set('content-type', detectedMime || headers.get('content-type'))
    headers.delete('content-security-policy')
    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: headers,
    })
  }

  return originResponse
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request)
  },
}
