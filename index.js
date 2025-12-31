function guessMime(base, defaultMime) {
  const lowercaseBase = base.toLowerCase()

  if (lowercaseBase.endsWith('.html')) {
    return 'text/html'
  }
  if (lowercaseBase.endsWith('.jpg') || lowercaseBase.endsWith('.jpeg')) {
    return 'image/jpeg'
  }
  if (lowercaseBase.endsWith('.png')) {
    return 'image/png'
  }
  if (lowercaseBase.endsWith('.svg')) {
    return 'image/svg+xml'
  }
  if (lowercaseBase.endsWith('.css')) {
    return 'text/css'
  }
  if (lowercaseBase.endsWith('.js')) {
    return 'text/javascript'
  }

  return defaultMime
}

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
    headers.set(
      'content-type',
      guessMime(baseOriginURL, headers.get('content-type')),
    )
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
