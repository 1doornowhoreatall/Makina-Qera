const router = require('express').Router();
const klientController = require('../controllers/klientController');
const { autentiko, kerkoAdmin } = require('../middleware/auth');
const { validimoId } = require('../middleware/validators');

/**
 * @swagger
 * /api/kliente:
 *   get:
 *     summary: Lista e klientëve (Vetëm Admin)
 *     tags: [Klientë]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista e klientëve }
 */
router.get('/', autentiko, kerkoAdmin, klientController.lista);
router.get('/:id', autentiko, kerkoAdmin, validimoId, klientController.detajet);
router.put('/:id', autentiko, kerkoAdmin, validimoId, klientController.perditeso);
router.delete('/:id', autentiko, kerkoAdmin, validimoId, klientController.fshi);

module.exports = router;
