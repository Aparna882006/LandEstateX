
const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

async function predictPropertyPrice(propertyData) {
  let response;

  try {
    response = await fetch(
      `${AI_SERVICE_URL.replace(/\/+$/, '')}/api/price-prediction/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
        signal: AbortSignal.timeout(15000),
      }
    );
  } catch (error) {
    const serviceError = new Error(
      error.name === 'TimeoutError'
        ? 'AI service timed out. Please try again.'
        : 'AI service is unavailable. Make sure the FastAPI server is running.'
    );

    serviceError.statusCode = 503;
    throw serviceError;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const serviceError = new Error(
      result?.detail || result?.message || 'Price prediction failed.'
    );

    // AI service errors are upstream errors, not client validation errors.
    serviceError.statusCode = 502;
    throw serviceError;
  }

  return result;
}

module.exports = { predictPropertyPrice };
