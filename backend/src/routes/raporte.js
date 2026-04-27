const router = require('express').Router();
const raportController = require('../controllers/raportController');
const { autentiko, kerkoAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/raporte/statistika:
 *   get:
 *     summary: Statistika të përgjithshme për dashboard
 *     tags: [Raporte]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Statistikat }
 */
router.get('/statistika', autentiko, kerkoAdmin, raportController.statistika);

/**
 * @swagger
 * /api/raporte/perdorimi:
 *   get:
 *     summary: Raporti i përdorimit të automjeteve
 *     tags: [Raporte]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Raporti i përdorimit }
 */
router.get('/perdorimi', autentiko, kerkoAdmin, raportController.raportiPerdorimit);

/**
 * @swagger
 * /api/raporte/sigurime:
 *   get:
 *     summary: Raporti i sigurimeve (aktive, që skadojnë, të skaduara)
 *     tags: [Raporte]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Raporti i sigurimeve }
 */
router.get('/sigurime', autentiko, kerkoAdmin, raportController.raportiSigurimeve);

module.exports = router;
