import mime from 'mime/lite'

/**
 * Handle incoming request
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = new URL(request.url)

  const baseOriginURL = url.pathname
    .substring(1)
    .split(/:\/\/?/, 2)
    .join('://')

  const originURL = new URL([baseOriginURL, url.search, url.hash].join(''))
  console.log(originURL)

  const originResponse = await fetch(originURL)
  if (originResponse.ok) {
    let headers = new Headers(originResponse.headers)
    const detectedMime = mime.getType(baseOriginURL)
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
