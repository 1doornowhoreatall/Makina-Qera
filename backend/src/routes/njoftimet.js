const router = require('express').Router();
const njoftimController = require('../controllers/njoftimController');
const { autentiko } = require('../middleware/auth');

/**
 * @swagger
 * /api/njoftimet:
 *   get:
 *     summary: Lista e njoftimeve të përdoruesit
 *     tags: [Njoftimet]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista e njoftimeve }
 */
router.get('/', autentiko, njoftimController.lista);

/**
 * @swagger
 * /api/njoftimet/lexo-te-gjitha:
 *   put:
 *     summary: Shëno të gjitha njoftimet si të lexuara
 *     tags: [Njoftimet]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Njoftimet u shënuan }
 */
router.put('/lexo-te-gjitha', autentiko, njoftimController.lexoTeGjitha);

router.put('/:id/lexo', autentiko, njoftimController.shenioLexuar);

module.exports = router;
