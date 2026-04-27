const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const { User } = require('../models');

/**
 * Middleware për autentikim — verifikon JWT token
 */
const autentiko = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        sukses: false,
        mesazh: 'Aksesi i paautorizuar. Ju lutem identifikohuni.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, authConfig.secret);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        sukses: false,
        mesazh: 'Përdoruesi nuk u gjet. Token i pavlefshëm.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        sukses: false,
        mesazh: 'Token i pavlefshëm.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        sukses: false,
        mesazh: 'Token i skaduar. Ju lutem identifikohuni përsëri.'
      });
    }
    next(error);
  }
};

/**
 * Middleware për autorizim — kontrollon rolin Admin
 */
const kerkoAdmin = (req, res, next) => {
  if (req.user && req.user.roli === 'admin') {
    return next();
  }
  return res.status(403).json({
    sukses: false,
    mesazh: 'Aksesi i ndaluar. Kërkohet roli Administrator.'
  });
};

/**
 * Middleware për autorizim — kontrollon rolin Klient
 */
const kerkoKlient = (req, res, next) => {
  if (req.user && req.user.roli === 'klient') {
    return next();
  }
  return res.status(403).json({
    sukses: false,
    mesazh: 'Aksesi i ndaluar. Kërkohet roli Klient.'
  });
};

/**
 * Middleware opsionale — nëse ka token, shtojmë userin; nëse jo, vazhdon
 */
const autentikoOpsionale = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, authConfig.secret);
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Injorojmë gabimin — autentikimi është opsional
  }
  next();
};

module.exports = {
  autentiko,
  kerkoAdmin,
  kerkoKlient,
  autentikoOpsionale
};
