function errorHandler(err, req, res, next){
  if (err) {
      return res.status(err.status).json({ message: err.name })
  }
}

module.exports = errorHandler;