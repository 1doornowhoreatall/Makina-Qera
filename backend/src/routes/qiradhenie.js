const router = require('express').Router();
const qiraDhenieController = require('../controllers/qiraDhenieController');
const { autentiko, kerkoAdmin } = require('../middleware/auth');
const { validimoQiradhenie, validimoId } = require('../middleware/validators');

/**
 * @swagger
 * /api/qiradhenie:
 *   get:
 *     summary: Lista e qiradhënieve
 *     tags: [Qiradhënie]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista e qiradhënieve }
 */
router.get('/', autentiko, qiraDhenieController.lista);

/**
 * @swagger
 * /api/qiradhenie/kontrollo-disponueshmerine:
 *   get:
 *     summary: Kontrollo disponueshmërinë e automjetit
 *     tags: [Qiradhënie]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: automjet_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: data_fillimit
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: data_mbarimit
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Rezultati i kontrollit }
 */
router.get('/kontrollo-disponueshmerine', autentiko, qiraDhenieController.kontrolloDisponueshmerine);

router.get('/:id', autentiko, validimoId, qiraDhenieController.detajet);

/**
 * @swagger
 * /api/qiradhenie:
 *   post:
 *     summary: Krijo qiradhënie të re
 *     tags: [Qiradhënie]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Qiradhënia u krijua }
 *       400: { description: Automjeti i padisponueshëm ose pa sigurim }
 */
router.post('/', autentiko, validimoQiradhenie, qiraDhenieController.krijo);

router.put('/:id/statusi', autentiko, kerkoAdmin, validimoId, qiraDhenieController.ndryshStatuisin);

module.exports = router;
