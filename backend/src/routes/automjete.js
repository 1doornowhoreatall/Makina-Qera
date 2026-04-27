const router = require('express').Router();
const automjetController = require('../controllers/automjetController');
const { autentiko, kerkoAdmin, autentikoOpsionale } = require('../middleware/auth');
const { validimoAutomjet, validimoId } = require('../middleware/validators');

/**
 * @swagger
 * /api/automjete:
 *   get:
 *     summary: Lista e automjeteve me filtrime
 *     tags: [Automjete]
 *     parameters:
 *       - in: query
 *         name: modeli
 *         schema: { type: string }
 *         description: Filtro sipas modelit
 *       - in: query
 *         name: tipi_motorrit
 *         schema: { type: string, enum: [benzinë, naftë, elektrik, hibrid] }
 *       - in: query
 *         name: tipi_kambios
 *         schema: { type: string, enum: [manuale, automatike] }
 *       - in: query
 *         name: viti_min
 *         schema: { type: integer }
 *       - in: query
 *         name: viti_max
 *         schema: { type: integer }
 *       - in: query
 *         name: faqe
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: per_faqe
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Lista e automjeteve }
 */
router.get('/', autentikoOpsionale, automjetController.lista);

/**
 * @swagger
 * /api/automjete/{id}:
 *   get:
 *     summary: Detajet e automjetit
 *     tags: [Automjete]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Detajet e automjetit }
 *       404: { description: Nuk u gjet }
 */
router.get('/:id', validimoId, automjetController.detajet);

/**
 * @swagger
 * /api/automjete:
 *   post:
 *     summary: Krijo automjet të ri (Vetëm Admin)
 *     tags: [Automjete]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Automjeti u krijua }
 *       403: { description: Aksesi i ndaluar }
 */
router.post('/', autentiko, kerkoAdmin, validimoAutomjet, automjetController.krijo);

/**
 * @swagger
 * /api/automjete/{id}:
 *   put:
 *     summary: Përditëso automjetin (Vetëm Admin)
 *     tags: [Automjete]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Automjeti u përditësua }
 */
router.put('/:id', autentiko, kerkoAdmin, validimoId, automjetController.perditeso);

/**
 * @swagger
 * /api/automjete/{id}:
 *   delete:
 *     summary: Fshi automjetin (Vetëm Admin)
 *     tags: [Automjete]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Automjeti u fshi }
 */
router.delete('/:id', autentiko, kerkoAdmin, validimoId, automjetController.fshi);

module.exports = router;
