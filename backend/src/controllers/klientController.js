const { Op } = require('sequelize');
const { User, Qiradhenie } = require('../models');

/**
 * GET /api/kliente — Lista e klientëve (vetëm admin)
 */
const lista = async (req, res, next) => {
  try {
    const { emri, email, faqe = 1, per_faqe = 10 } = req.query;
    const where = { roli: 'klient' };

    if (emri) {
      where[Op.or] = [
        { emri: { [Op.iLike]: `%${emri}%` } },
        { mbiemri: { [Op.iLike]: `%${emri}%` } }
      ];
    }
    if (email) where.email = { [Op.iLike]: `%${email}%` };

    const offset = (parseInt(faqe) - 1) * parseInt(per_faqe);

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash', 'verification_token'] },
      include: [{
        model: Qiradhenie,
        as: 'qiradheniet',
        attributes: ['id', 'statusi'],
        required: false
      }],
      order: [['krijuar_me', 'DESC']],
      limit: parseInt(per_faqe),
      offset,
      distinct: true
    });

    res.json({
      sukses: true,
      te_dhena: {
        klientet: rows,
        totali: count,
        faqe: parseInt(faqe),
        faqe_totale: Math.ceil(count / parseInt(per_faqe))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/kliente/:id — Detajet e klientit (vetëm admin)
 */
const detajet = async (req, res, next) => {
  try {
    const klienti = await User.findOne({
      where: { id: req.params.id, roli: 'klient' },
      attributes: { exclude: ['password_hash', 'verification_token'] },
      include: [{
        model: Qiradhenie,
        as: 'qiradheniet',
        order: [['krijuar_me', 'DESC']]
      }]
    });

    if (!klienti) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Klienti nuk u gjet'
      });
    }

    res.json({
      sukses: true,
      te_dhena: klienti
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/kliente/:id — Përditëso klientin (vetëm admin)
 */
const perditeso = async (req, res, next) => {
  try {
    const klienti = await User.findOne({
      where: { id: req.params.id, roli: 'klient' }
    });

    if (!klienti) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Klienti nuk u gjet'
      });
    }

    const { emri, mbiemri, telefoni, email_verified } = req.body;

    if (emri) klienti.emri = emri;
    if (mbiemri) klienti.mbiemri = mbiemri;
    if (telefoni) klienti.telefoni = telefoni;
    if (email_verified !== undefined) klienti.email_verified = email_verified;

    await klienti.save();

    res.json({
      sukses: true,
      mesazh: 'Klienti u përditësua me sukses',
      te_dhena: klienti.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/kliente/:id — Fshi klientin (vetëm admin)
 */
const fshi = async (req, res, next) => {
  try {
    const klienti = await User.findOne({
      where: { id: req.params.id, roli: 'klient' }
    });

    if (!klienti) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Klienti nuk u gjet'
      });
    }

    // Kontrollo për qiradhënie aktive
    const qiraAktive = await Qiradhenie.count({
      where: { klient_id: klienti.id, statusi: 'aktive' }
    });

    if (qiraAktive > 0) {
      return res.status(400).json({
        sukses: false,
        mesazh: 'Nuk mund të fshihet klienti pasi ka qiradhënie aktive'
      });
    }

    await klienti.destroy();

    res.json({
      sukses: true,
      mesazh: 'Klienti u fshi me sukses'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { lista, detajet, perditeso, fshi };
