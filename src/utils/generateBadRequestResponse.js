export default function (h, error, title) {
  return h
    .response({
      errors: error.details.map((d) => ({
        title: title,
        status: 400,
        code: 'VALIDATION_ERROR',
        detail: {
          message: d.message,
          path: d.path.join('.')
        }
      }))
    })
    .code(400)
    .takeover();
}
