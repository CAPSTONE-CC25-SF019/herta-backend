/**
 *
 * @param status {number}
 * @returns {*|string}
 */
export default function (status) {
  const statusToCode = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    500: 'INTERNAL_SERVER_ERROR'
  };

  return statusToCode[status] || 'UNKNOWN_ERROR';
}
