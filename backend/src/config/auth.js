module.exports = {
  secret: process.env.JWT_SECRET || 'makina-qera-default-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: 12,
  verificationTokenExpiry: '24h'
};
