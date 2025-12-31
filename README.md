# Cloudflare Serve

Serve files with correct MIME types using Cloudflare Workers.

## Overview

This Cloudflare Worker proxies requests to external URLs and ensures files are served with the correct MIME types. It automatically detects and sets appropriate `Content-Type` headers for common file types.

## Development

This project uses [Wrangler](https://developers.cloudflare.com/workers/wrangler/) v4, the official Cloudflare Workers CLI.

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
npm install
```

### Local Development

Run the worker locally:

```bash
npm run dev
```

The worker will be available at `http://localhost:8787`.

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

Note: You'll need to configure your `account_id` in `wrangler.toml` before deploying.

## How It Works

The worker accepts URLs in the format:

```
https://your-worker.workers.dev/https://example.com/file.jpg
```

It will:

1. Extract the target URL from the path
2. Fetch the file from the target URL
3. Detect the MIME type based on the file extension using the lightweight `mime/lite` library
4. Set the correct `Content-Type` header
5. Remove `Content-Security-Policy` headers
6. Return the response with corrected headers

### MIME Type Detection

The worker uses the `mime/lite` library for MIME type detection, which supports all standard MIME types including:

- `.html` → `text/html`
- `.jpg`, `.jpeg` → `image/jpeg`
- `.png` → `image/png`
- `.svg` → `image/svg+xml`
- `.css` → `text/css`
- `.js` → `text/javascript`
- And many more standard file types

## License

This project is licensed under either of:

- Apache License, Version 2.0 ([LICENSE_APACHE](LICENSE_APACHE))
- MIT License ([LICENSE_MIT](LICENSE_MIT))

at your option.
