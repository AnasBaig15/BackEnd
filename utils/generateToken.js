const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_KEY, { expiresIn: '1h' });
}

module.exports = { generateToken };
