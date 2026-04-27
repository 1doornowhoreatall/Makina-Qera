const { Op } = require('sequelize');
const { Sigurim, Automjet } = require('../models');
const SigurimService = require('../services/sigurimService');

/**
 * GET /api/sigurime — Lista e sigurimeve
 */
const lista = async (req, res, next) => {
  try {
    const { automjet_id, emri_shoqerise, aktive, skaduara, faqe = 1, per_faqe = 10 } = req.query;
    const where = {};
    const sot = new Date();

    if (automjet_id) where.automjet_id = automjet_id;
    if (emri_shoqerise) where.emri_shoqerise = { [Op.iLike]: `%${emri_shoqerise}%` };
    
    if (aktive === 'true') {
      where.data_fillimit = { [Op.lte]: sot };
      where.data_mbarimit = { [Op.gte]: sot };
    }
    if (skaduara === 'true') {
      where.data_mbarimit = { [Op.lt]: sot };
    }

    const offset = (parseInt(faqe) - 1) * parseInt(per_faqe);

    const { count, rows } = await Sigurim.findAndCountAll({
      where,
      include: [{
        model: Automjet,
        as: 'automjeti',
        attributes: ['id', 'targa', 'modeli']
      }],
      order: [['data_mbarimit', 'DESC']],
      limit: parseInt(per_faqe),
      offset,
      distinct: true
    });

    res.json({
      sukses: true,
      te_dhena: {
        sigurimet: rows,
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
 * GET /api/sigurime/:id — Detajet e sigurimit
 */
const detajet = async (req, res, next) => {
  try {
    const sigurim = await Sigurim.findByPk(req.params.id, {
      include: [{
        model: Automjet,
        as: 'automjeti'
      }]
    });

    if (!sigurim) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Sigurimi nuk u gjet'
      });
    }

    res.json({
      sukses: true,
      te_dhena: sigurim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sigurime — Krijo sigurim të ri
 */
const krijo = async (req, res, next) => {
  try {
    const { automjet_id, emri_shoqerise, data_fillimit, data_mbarimit, kosto } = req.body;

    // Kontrollo nëse automjeti ekziston
    const automjeti = await Automjet.findByPk(automjet_id);
    if (!automjeti) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Automjeti nuk u gjet'
      });
    }

    const sigurim = await Sigurim.create({
      automjet_id,
      emri_shoqerise,
      data_fillimit,
      data_mbarimit,
      kosto
    });

    res.status(201).json({
      sukses: true,
      mesazh: 'Sigurimi u shtua me sukses',
      te_dhena: sigurim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/sigurime/:id — Përditëso sigurimin
 */
const perditeso = async (req, res, next) => {
  try {
    const sigurim = await Sigurim.findByPk(req.params.id);
    if (!sigurim) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Sigurimi nuk u gjet'
      });
    }

    const { emri_shoqerise, data_fillimit, data_mbarimit, kosto } = req.body;

    if (emri_shoqerise) sigurim.emri_shoqerise = emri_shoqerise;
    if (data_fillimit) sigurim.data_fillimit = data_fillimit;
    if (data_mbarimit) sigurim.data_mbarimit = data_mbarimit;
    if (kosto !== undefined) sigurim.kosto = kosto;

    await sigurim.save();

    res.json({
      sukses: true,
      mesazh: 'Sigurimi u përditësua me sukses',
      te_dhena: sigurim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/sigurime/:id — Fshi sigurimin
 */
const fshi = async (req, res, next) => {
  try {
    const sigurim = await Sigurim.findByPk(req.params.id);
    if (!sigurim) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Sigurimi nuk u gjet'
      });
    }

    await sigurim.destroy();

    res.json({
      sukses: true,
      mesazh: 'Sigurimi u fshi me sukses'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sigurime/qe-skadojne — Sigurimet që skadojnë brenda 30 ditëve
 */
const qeSkadojne = async (req, res, next) => {
  try {
    const dite = parseInt(req.query.dite) || 30;
    const sigurimet = await SigurimService.gjejSiguriQeSkadonjne(dite);

    res.json({
      sukses: true,
      te_dhena: {
        sigurimet,
        totali: sigurimet.length,
        dite
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { lista, detajet, krijo, perditeso, fshi, qeSkadojne };
