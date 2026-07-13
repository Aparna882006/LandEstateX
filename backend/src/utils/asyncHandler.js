// Wraps async controller functions so we never need try/catch 
// repeated in every controller — errors are passed to next()
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;