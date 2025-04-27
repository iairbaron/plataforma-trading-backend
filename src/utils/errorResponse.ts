export function createErrorResponse(code: string, message: string, field?: string) {
  return {
    status: 'error',
    code,
    errors: field ? [{ field, message }] : [{ message }],
  };
} 