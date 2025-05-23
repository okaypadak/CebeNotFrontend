import { defineEventHandler, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const res = await ofetch('http://cebenotbackend.railway.internal/api/login', {
    method: 'POST',
    body,
  })

  return res
})
