const { JWT_SECRET } = require('../secrets')
const jwt = require('jsonwebtoken');
const { findBy } = require('../users/users-model')

const restricted = (req, res, next) => {
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
      const token = req.headers.authorization
      if (!token) {
       return next({ status: 401, message: 'token required'})
      } 
      jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
       if (err) {
         next({ status: 401, message: 'token invalid'})
       } else {
         req.decodedToken = decodedToken
         next()
       }
      })
};

const checkRegPayload = (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    next({ status: 422, message: 'username and password required'})
  } else {
    next()
  }
}

const checkUsernameAvailable = async (req, res, next) => {
  try {
    const [user] = await findBy({ username: req.body.username})
    if(!user) {
      req.user = user
      next()
    } else {
      next({ status: 401, message: 'username taken'})
    }
  } catch (err) {
    next(err)
  }
}

module.exports = { restricted, checkRegPayload, checkUsernameAvailable }