import { REST_GET } from '@payloadcms/next/routes'
import { describe, expect, it } from 'vitest'

import config from '../src/payload.config'

// Обработчик тот же, что в src/app/(payload)/api/[...slug]/route.ts,
// поэтому проверяется настоящий HTTP-ответ REST API, а не Local API.
const GET = REST_GET(config)

describe('users access', () => {
  it('AC-5: anonymous GET /api/users returns 403', async () => {
    const request = new Request('http://localhost:3000/api/users')

    const response = await GET(request, { params: Promise.resolve({ slug: ['users'] }) })

    expect(response.status).toBe(403)
  })
})
