// Wraps an async Express route handler so that any rejected promise
// (e.g. a MongoDB error) is forwarded to next(error) -> errorHandler,
// instead of hanging the request or crashing the process.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
