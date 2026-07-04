export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const origin = new URL(request.url).origin
    const response = await fetch(`${origin}/api/ml_predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return Response.json(
        { data: null, error: data?.detail || 'Prediction service is unavailable' },
        { status: response.status }
      )
    }

    return Response.json({ data, error: null })
  } catch {
    return Response.json(
      { data: null, error: 'Could not reach the salary prediction service' },
      { status: 502 }
    )
  }
}
