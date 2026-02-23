const catchAsync = (fn) => {
  return (req, res, next) => {
    // This executes the controller function and catches any rejected promises
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

module.exports = catchAsync;