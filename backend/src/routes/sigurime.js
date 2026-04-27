const router = require('express').Router();
const sigurimController = require('../controllers/sigurimController');
const { autentiko, kerkoAdmin } = require('../middleware/auth');
const { validimoSigurim, validimoId } = require('../middleware/validators');

/**
 * @swagger
 * /api/sigurime:
 *   get:
 *     summary: Lista e sigurimeve
 *     tags: [Sigurime]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: automjet_id
 *         schema: { type: integer }
 *       - in: query
 *         name: aktive
 *         schema: { type: boolean }
 *       - in: query
 *         name: skaduara
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Lista e sigurimeve }
 */
router.get('/', autentiko, kerkoAdmin, sigurimController.lista);

/**
 * @swagger
 * /api/sigurime/qe-skadojne:
 *   get:
 *     summary: Sigurimet që skadojnë brenda 30 ditëve
 *     tags: [Sigurime]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista e sigurimeve që skadojnë }
 */
router.get('/qe-skadojne', autentiko, kerkoAdmin, sigurimController.qeSkadojne);

router.get('/:id', autentiko, kerkoAdmin, validimoId, sigurimController.detajet);
router.post('/', autentiko, kerkoAdmin, validimoSigurim, sigurimController.krijo);
router.put('/:id', autentiko, kerkoAdmin, validimoId, sigurimController.perditeso);
router.delete('/:id', autentiko, kerkoAdmin, validimoId, sigurimController.fshi);

module.exports = router;
