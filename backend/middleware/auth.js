const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const fs = require('fs');

const protect = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return next(new ApiError(401, 'Invalid token'));
    }

    // Don’t expose password downstream
    user.password = undefined;
    req.user = user;
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = { protect };


