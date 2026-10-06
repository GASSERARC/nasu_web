// Error type shared by every backend implementation, so views can show
// friendly messages without knowing which backend produced the error.

export class ApiError extends Error {
  /**
   * @param {string} code    machine-readable: 'invalid_input' | 'invalid_credentials' |
   *                         'activation_failed' | 'activation_expired' | 'unauthenticated' |
   *                         'not_found' | 'network' | 'not_configured' | 'unknown'
   * @param {string} message human-readable, safe to show to the student
   */
  constructor(code, message) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export function toApiError(err) {
  if (err instanceof ApiError) return err;
  if (err instanceof TypeError) return new ApiError('network', 'Could not reach the server. Check your connection and try again.');
  return new ApiError('unknown', 'Something went wrong. Please try again.');
}
