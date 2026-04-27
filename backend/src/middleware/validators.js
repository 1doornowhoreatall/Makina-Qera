const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware që kontrollon rezultatin e validimeve
 */
const kontrolloValidimin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      sukses: false,
      mesazh: 'Gabime validimi',
      gabime: errors.array().map(err => ({
        fushe: err.path,
        mesazh: err.msg
      }))
    });
  }
  next();
};

/**
 * Validime për regjistrim
 */
const validimoRegjistrim = [
  body('emri')
    .trim().notEmpty().withMessage('Emri është i detyrueshëm')
    .isLength({ min: 2, max: 100 }).withMessage('Emri duhet të ketë 2-100 karaktere'),
  body('mbiemri')
    .trim().notEmpty().withMessage('Mbiemri është i detyrueshëm')
    .isLength({ min: 2, max: 100 }).withMessage('Mbiemri duhet të ketë 2-100 karaktere'),
  body('email')
    .trim().isEmail().withMessage('Email-i nuk është i vlefshëm')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Fjalëkalimi duhet të ketë së paku 8 karaktere')
    .matches(/[A-Z]/).withMessage('Fjalëkalimi duhet të përmbajë së paku një shkronjë të madhe')
    .matches(/[0-9]/).withMessage('Fjalëkalimi duhet të përmbajë së paku një numër'),
  body('datelindja')
    .notEmpty().withMessage('Datëlindja është e detyrueshme')
    .isDate().withMessage('Formati i datës nuk është i vlefshëm'),
  body('nr_personal')
    .trim().notEmpty().withMessage('Numri personal i identifikimit është i detyrueshëm')
    .isLength({ min: 5, max: 20 }).withMessage('Numri personal duhet të ketë 5-20 karaktere'),
  body('telefoni')
    .trim().notEmpty().withMessage('Numri i telefonit është i detyrueshëm'),
  kontrolloValidimin
];

/**
 * Validime për hyrje (login)
 */
const validimoHyrje = [
  body('email')
    .trim().isEmail().withMessage('Email-i nuk është i vlefshëm')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Fjalëkalimi është i detyrueshëm'),
  kontrolloValidimin
];

/**
 * Validime për automjet
 */
const validimoAutomjet = [
  body('targa')
    .trim().notEmpty().withMessage('Targa është e detyrueshme')
    .isLength({ min: 2, max: 20 }).withMessage('Targa duhet të ketë 2-20 karaktere'),
  body('modeli')
    .trim().notEmpty().withMessage('Modeli është i detyrueshëm')
    .isLength({ min: 2, max: 100 }).withMessage('Modeli duhet të ketë 2-100 karaktere'),
  body('viti_prodhimit')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage(`Viti i prodhimit duhet të jetë ndërmjet 1990 dhe ${new Date().getFullYear() + 1}`),
  body('nr_max_pasagjeresh')
    .isInt({ min: 1, max: 50 }).withMessage('Numri i pasagjerëve duhet të jetë 1-50'),
  body('tipi_motorrit')
    .isIn(['benzinë', 'naftë', 'elektrik', 'hibrid'])
    .withMessage('Tipi i motorrit duhet të jetë: benzinë, naftë, elektrik, ose hibrid'),
  body('tipi_kambios')
    .isIn(['manuale', 'automatike'])
    .withMessage('Tipi i kambios duhet të jetë: manuale ose automatike'),
  body('kilometrazhi')
    .isInt({ min: 0 }).withMessage('Kilometrazhi nuk mund të jetë negativ'),
  body('cmimi_ditor')
    .isFloat({ min: 0 }).withMessage('Çmimi ditor nuk mund të jetë negativ'),
  kontrolloValidimin
];

/**
 * Validime për sigurim
 */
const validimoSigurim = [
  body('automjet_id')
    .isInt({ min: 1 }).withMessage('ID e automjetit nuk është e vlefshme'),
  body('emri_shoqerise')
    .trim().notEmpty().withMessage('Emri i shoqërisë së sigurimit është i detyrueshëm'),
  body('data_fillimit')
    .isDate().withMessage('Data e fillimit nuk është e vlefshme'),
  body('data_mbarimit')
    .isDate().withMessage('Data e mbarimit nuk është e vlefshme'),
  body('kosto')
    .isFloat({ min: 0 }).withMessage('Kosto nuk mund të jetë negative'),
  kontrolloValidimin
];

/**
 * Validime për qiradhënie
 */
const validimoQiradhenie = [
  body('automjet_id')
    .isInt({ min: 1 }).withMessage('ID e automjetit nuk është e vlefshme'),
  body('data_terheqjes')
    .notEmpty().withMessage('Data e tërheqjes është e detyrueshme')
    .isISO8601().withMessage('Formati i datës së tërheqjes nuk është i vlefshëm'),
  body('vendi_terheqjes')
    .trim().notEmpty().withMessage('Vendi i tërheqjes është i detyrueshëm'),
  body('data_dorezimit')
    .notEmpty().withMessage('Data e dorëzimit është e detyrueshme')
    .isISO8601().withMessage('Formati i datës së dorëzimit nuk është i vlefshëm'),
  body('vendi_dorezimit')
    .trim().notEmpty().withMessage('Vendi i dorëzimit është i detyrueshëm'),
  kontrolloValidimin
];

/**
 * Validim për parametrin ID
 */
const validimoId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID nuk është e vlefshme'),
  kontrolloValidimin
];

module.exports = {
  kontrolloValidimin,
  validimoRegjistrim,
  validimoHyrje,
  validimoAutomjet,
  validimoSigurim,
  validimoQiradhenie,
  validimoId
};
