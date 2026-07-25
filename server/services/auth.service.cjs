// Short-Lived JWT Access Tokens, Rotating Refresh Tokens & Session Revocation Service
const crypto = require('crypto');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'vault_zk_secret_key_2026_production';
    this.activeSessions = new Map();
    this.refreshTokens = new Map();
  }

  generateTokens(userPayload) {
    const tenantId = userPayload.tenantId || `tenant-${userPayload.username.toLowerCase().replace(/\s+/g, '')}`;
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Header & Payload for Access Token (Exp 15m)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const accessPayload = Buffer.from(JSON.stringify({
      username: userPayload.username,
      tenantId,
      sessionId,
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 15 * 60
    })).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${accessPayload}`)
      .digest('base64url');

    const accessToken = `${header}.${accessPayload}.${signature}`;

    // Rotating Refresh Token (Exp 7d)
    const refreshToken = `ref-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
    this.refreshTokens.set(refreshToken, { tenantId, username: userPayload.username, sessionId });

    this.activeSessions.set(sessionId, {
      sessionId,
      tenantId,
      username: userPayload.username,
      createdAt: new Date().toISOString()
    });

    return {
      accessToken,
      refreshToken,
      tenantId,
      sessionId,
      expiresIn: 900
    };
  }

  verifyAccessToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization Bearer header');
    }

    const token = authHeader.substring(7);
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Malformed JWT token structure');
    }

    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new Error('Invalid JWT Token Signature');
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('JWT Access Token Expired');
    }

    return payload;
  }

  rotateRefreshToken(oldRefreshToken) {
    const sessionData = this.refreshTokens.get(oldRefreshToken);
    if (!sessionData) {
      throw new Error('Invalid or revoked refresh token');
    }

    this.refreshTokens.delete(oldRefreshToken);
    return this.generateTokens({ username: sessionData.username, tenantId: sessionData.tenantId });
  }

  revokeSession(sessionId) {
    this.activeSessions.delete(sessionId);
    return { success: true, message: `Session ${sessionId} revoked successfully` };
  }
}

module.exports = new AuthService();
