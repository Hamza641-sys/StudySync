const { firebaseAuth, isFirebaseActive } = require('../config/firebase');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const customUserId = req.headers['x-user-id'];

    let token = null;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1].trim();
    }

    if (!token && !customUserId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Authentication token or user ID is required.'
      });
    }

    // If Firebase Admin is active and we have a bearer token that looks like a JWT
    if (isFirebaseActive() && token && token.length > 50) {
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Student',
          authType: 'firebase'
        };
        return next();
      } catch (fbErr) {
        console.warn('[AuthMiddleware] Firebase verify failed, checking fallback token:', fbErr.message);
      }
    }

    // Standard session / demo user token format
    const resolvedUserId = customUserId || token;
    if (!resolvedUserId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication credentials provided.'
      });
    }

    req.user = {
      id: resolvedUserId,
      email: req.headers['x-user-email'] || `${resolvedUserId}@studysync.local`,
      name: req.headers['x-user-name'] || 'Student User',
      authType: 'session'
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Unexpected auth error:', error.message);
    res.status(401).json({
      success: false,
      error: 'Authentication failed.'
    });
  }
}

module.exports = authMiddleware;
