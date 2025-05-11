export default function (h, error, title) {
  return h
    .response({
      title: title,
      status: 400,
      code: 'VALIDATION_ERROR',
      details: error.details.map((d) => ({
        message: d.message,
        path: d.path.join('.')
      }))
    })
    .code(400)
    .takeover();
}
