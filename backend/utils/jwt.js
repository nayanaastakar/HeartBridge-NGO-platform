const jwt = require('jsonwebtoken');

function signToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'dev_secret_change_me',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

module.exports = { signToken };


