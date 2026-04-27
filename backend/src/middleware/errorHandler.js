/**
 * Middleware për trajtimin e gabimeve globale
 */
const trajtuesGabimesh = (err, req, res, next) => {
  console.error('❌ Gabim:', err);

  // Gabime Sequelize — validim
  if (err.name === 'SequelizeValidationError') {
    const gabime = err.errors.map(e => ({
      fushe: e.path,
      mesazh: e.message
    }));
    return res.status(400).json({
      sukses: false,
      mesazh: 'Gabime validimi',
      gabime
    });
  }

  // Gabime Sequelize — constraint unik
  if (err.name === 'SequelizeUniqueConstraintError') {
    const gabime = err.errors.map(e => ({
      fushe: e.path,
      mesazh: e.message
    }));
    return res.status(409).json({
      sukses: false,
      mesazh: 'Rekord ekzistues i njëjtë',
      gabime
    });
  }

  // Gabime Sequelize — foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      sukses: false,
      mesazh: 'Referencë e pavlefshme. Objekti i referuar nuk ekziston.'
    });
  }

  // Gabim i përgjithshëm
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    sukses: false,
    mesazh: err.message || 'Gabim i brendshëm i serverit',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware për rrugë që nuk gjenden (404)
 */
const rrugaNukGjendet = (req, res) => {
  res.status(404).json({
    sukses: false,
    mesazh: `Rruga ${req.method} ${req.originalUrl} nuk u gjet`
  });
};

module.exports = {
  trajtuesGabimesh,
  rrugaNukGjendet
};
