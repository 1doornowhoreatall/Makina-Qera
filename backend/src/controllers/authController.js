const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const authConfig = require('../config/auth');
const { User } = require('../models');
const { dergoEmailVerifikim } = require('../utils/email');

/**
 * Gjeneron JWT token
 */
const gjeneorToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, roli: user.roli },
    authConfig.secret,
    { expiresIn: authConfig.expiresIn }
  );
};

/**
 * POST /api/auth/regjistrim — Regjistrim i përdoruesit të ri
 */
const regjistrim = async (req, res, next) => {
  try {
    const { emri, mbiemri, email, password, datelindja, nr_personal, telefoni } = req.body;

    // Kontrollo nëse email ekziston
    const ekziston = await User.findOne({ where: { email } });
    if (ekziston) {
      return res.status(409).json({
        sukses: false,
        mesazh: 'Ky email është i regjistruar tashmë'
      });
    }

    // Gjenero token verifikimi
    const verificationToken = uuidv4();

    // Krijo përdoruesin
    const user = await User.create({
      emri,
      mbiemri,
      email,
      password_hash: password,
      datelindja,
      nr_personal,
      telefoni,
      roli: 'klient',
      verification_token: verificationToken
    });

    // Dërgo email verifikimi
    await dergoEmailVerifikim(email, verificationToken);

    // Gjenero token
    const token = gjeneorToken(user);

    res.status(201).json({
      sukses: true,
      mesazh: 'Regjistrimi u krye me sukses. Kontrolloni email-in tuaj për verifikim.',
      te_dhena: {
        perdoruesi: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/hyrje — Hyrje (login)
 */
const hyrje = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Gjej përdoruesin
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        sukses: false,
        mesazh: 'Email ose fjalëkalim i gabuar'
      });
    }

    // Verifiko fjalëkalimin
    const passwordSakte = await user.verifikoPassword(password);
    if (!passwordSakte) {
      return res.status(401).json({
        sukses: false,
        mesazh: 'Email ose fjalëkalim i gabuar'
      });
    }

    // Gjenero token
    const token = gjeneorToken(user);

    res.json({
      sukses: true,
      mesazh: 'Hyrja u krye me sukses',
      te_dhena: {
        perdoruesi: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/verifiko-email/:token — Verifikim email
 */
const verifikoEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      return res.status(400).json({
        sukses: false,
        mesazh: 'Token verifikimi i pavlefshëm ose i skaduar'
      });
    }

    user.email_verified = true;
    user.verification_token = null;
    await user.save();

    res.json({
      sukses: true,
      mesazh: 'Email-i u verifikua me sukses!'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/profili — Profili i përdoruesit aktual
 */
const profili = async (req, res, next) => {
  try {
    res.json({
      sukses: true,
      te_dhena: req.user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profili — Përditëso profilin
 */
const perditesoProfili = async (req, res, next) => {
  try {
    const { emri, mbiemri, telefoni } = req.body;

    if (emri) req.user.emri = emri;
    if (mbiemri) req.user.mbiemri = mbiemri;
    if (telefoni) req.user.telefoni = telefoni;

    await req.user.save();

    res.json({
      sukses: true,
      mesazh: 'Profili u përditësua me sukses',
      te_dhena: req.user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  regjistrim,
  hyrje,
  verifikoEmail,
  profili,
  perditesoProfili
};
