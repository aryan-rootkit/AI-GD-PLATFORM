function errorMiddleware(err, _req, res, _next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    });
    return;
  }

  const status = err.status || 500;
  const message = status >= 500 ? 'Internal Server Error' : err.message || 'Request failed';
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ success: false, message });
}

module.exports = { errorMiddleware };
