const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded user object to the request object
    req.user = decoded.user;
    
    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    // If the token is invalid or expired, send an error response
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authenticateJWT;
