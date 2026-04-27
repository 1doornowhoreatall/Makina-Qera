const router = require('express').Router();
const authController = require('../controllers/authController');
const { autentiko } = require('../middleware/auth');
const { validimoRegjistrim, validimoHyrje } = require('../middleware/validators');

/**
 * @swagger
 * /api/auth/regjistrim:
 *   post:
 *     summary: Regjistrim i përdoruesit të ri
 *     tags: [Autentikim]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emri, mbiemri, email, password, datelindja, nr_personal, telefoni]
 *             properties:
 *               emri: { type: string, example: "Andi" }
 *               mbiemri: { type: string, example: "Hoxha" }
 *               email: { type: string, example: "andi@email.com" }
 *               password: { type: string, example: "Password123" }
 *               datelindja: { type: string, format: date, example: "2000-01-15" }
 *               nr_personal: { type: string, example: "I12345678A" }
 *               telefoni: { type: string, example: "+355691234567" }
 *     responses:
 *       201: { description: Regjistrim i suksesshëm }
 *       400: { description: Gabime validimi }
 *       409: { description: Email ekziston }
 */
router.post('/regjistrim', validimoRegjistrim, authController.regjistrim);

/**
 * @swagger
 * /api/auth/hyrje:
 *   post:
 *     summary: Hyrje në sistem (login)
 *     tags: [Autentikim]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@makinaqera.al" }
 *               password: { type: string, example: "Admin123!" }
 *     responses:
 *       200: { description: Hyrje e suksesshme }
 *       401: { description: Kredenciale të gabuara }
 */
router.post('/hyrje', validimoHyrje, authController.hyrje);

/**
 * @swagger
 * /api/auth/verifiko-email/{token}:
 *   get:
 *     summary: Verifiko adresën e email-it
 *     tags: [Autentikim]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Email u verifikua }
 *       400: { description: Token i pavlefshëm }
 */
router.get('/verifiko-email/:token', authController.verifikoEmail);

/**
 * @swagger
 * /api/auth/profili:
 *   get:
 *     summary: Merr profilin e përdoruesit aktual
 *     tags: [Autentikim]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profili i përdoruesit }
 *       401: { description: I paautorizuar }
 */
router.get('/profili', autentiko, authController.profili);

/**
 * @swagger
 * /api/auth/profili:
 *   put:
 *     summary: Përditëso profilin
 *     tags: [Autentikim]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profili u përditësua }
 */
router.put('/profili', autentiko, authController.perditesoProfili);

module.exports = router;
