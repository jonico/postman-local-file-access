let AUTH_TOKEN = process.env.AUTH_TOKEN || null;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'No token provided',
      code: 'TOKEN_MISSING'
    });
  }

  const token = authHeader.split(' ')[1];
  
  if (!AUTH_TOKEN || token !== AUTH_TOKEN) {
    return res.status(401).json({ 
      error: 'Invalid token',
      code: 'TOKEN_INVALID'
    });
  }

  next();
};

const setAuthToken = (token) => {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('Invalid token format');
  }

  const trimmedToken = token.trim();
  const currentToken = AUTH_TOKEN ? AUTH_TOKEN.trim() : null;
  
  // If the token is the same as the current one, just return successfully
  if (currentToken && trimmedToken === currentToken) {
    return;
  }
  
  // Only throw if trying to set a different token
  if (AUTH_TOKEN) {
    throw new Error('Token already set');
  }

  AUTH_TOKEN = trimmedToken;
};

const isTokenSet = () => Boolean(AUTH_TOKEN);

module.exports = { authMiddleware, setAuthToken, isTokenSet }; 