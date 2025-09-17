require('dotenv').config();
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    console.log("No token provided");
    return res.status(403).json({ message: 'Token not provided' });
  }

  // console.log(token)
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log("JWT verification failed:", err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
};

module.exports = authMiddleware;
