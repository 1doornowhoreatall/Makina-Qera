const { Op } = require('sequelize');
const { Automjet, Sigurim, Qiradhenie } = require('../models');

/**
 * GET /api/automjete — Lista e automjeteve me filtrime
 */
const lista = async (req, res, next) => {
  try {
    const {
      modeli, viti_min, viti_max, tipi_motorrit, tipi_kambios,
      statusi, disponueshem, faqe = 1, per_faqe = 10, rendit = 'krijuar_me', drejt = 'DESC'
    } = req.query;

    const where = {};

    if (modeli) where.modeli = { [Op.iLike]: `%${modeli}%` };
    if (viti_min) where.viti_prodhimit = { ...where.viti_prodhimit, [Op.gte]: parseInt(viti_min) };
    if (viti_max) where.viti_prodhimit = { ...where.viti_prodhimit, [Op.lte]: parseInt(viti_max) };
    if (tipi_motorrit) where.tipi_motorrit = tipi_motorrit;
    if (tipi_kambios) where.tipi_kambios = tipi_kambios;
    if (statusi) where.statusi = statusi;

    // Per klientët, shfaq vetëm automjetet aktive
    if (req.user && req.user.roli === 'klient') {
      where.statusi = 'aktiv';
    }

    const offset = (parseInt(faqe) - 1) * parseInt(per_faqe);

    const { count, rows } = await Automjet.findAndCountAll({
      where,
      include: [{
        model: Sigurim,
        as: 'sigurimet',
        attributes: ['id', 'emri_shoqerise', 'data_fillimit', 'data_mbarimit'],
        required: false
      }],
      order: [[rendit, drejt.toUpperCase()]],
      limit: parseInt(per_faqe),
      offset,
      distinct: true
    });

    res.json({
      sukses: true,
      te_dhena: {
        automjetet: rows,
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
 * GET /api/automjete/:id — Detajet e automjetit
 */
const detajet = async (req, res, next) => {
  try {
    const automjeti = await Automjet.findByPk(req.params.id, {
      include: [
        {
          model: Sigurim,
          as: 'sigurimet',
          order: [['data_mbarimit', 'DESC']]
        },
        {
          model: Qiradhenie,
          as: 'qiradheniet',
          attributes: ['id', 'data_terheqjes', 'data_dorezimit', 'statusi'],
          order: [['data_terheqjes', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!automjeti) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Automjeti nuk u gjet'
      });
    }

    res.json({
      sukses: true,
      te_dhena: automjeti
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/automjete — Krijo automjet të ri (vetëm admin)
 */
const krijo = async (req, res, next) => {
  try {
    const {
      targa, modeli, viti_prodhimit, nr_max_pasagjeresh,
      tipi_motorrit, tipi_kambios, kilometrazhi, cmimi_ditor, foto_url
    } = req.body;

    const automjeti = await Automjet.create({
      targa: targa.toUpperCase(),
      modeli,
      viti_prodhimit,
      nr_max_pasagjeresh,
      tipi_motorrit,
      tipi_kambios,
      kilometrazhi,
      cmimi_ditor,
      foto_url
    });

    res.status(201).json({
      sukses: true,
      mesazh: 'Automjeti u shtua me sukses',
      te_dhena: automjeti
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/automjete/:id — Përditëso automjetin (vetëm admin)
 */
const perditeso = async (req, res, next) => {
  try {
    const automjeti = await Automjet.findByPk(req.params.id);
    if (!automjeti) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Automjeti nuk u gjet'
      });
    }

    const {
      targa, modeli, viti_prodhimit, nr_max_pasagjeresh,
      tipi_motorrit, tipi_kambios, kilometrazhi, cmimi_ditor, foto_url, statusi
    } = req.body;

    if (targa) automjeti.targa = targa.toUpperCase();
    if (modeli) automjeti.modeli = modeli;
    if (viti_prodhimit) automjeti.viti_prodhimit = viti_prodhimit;
    if (nr_max_pasagjeresh) automjeti.nr_max_pasagjeresh = nr_max_pasagjeresh;
    if (tipi_motorrit) automjeti.tipi_motorrit = tipi_motorrit;
    if (tipi_kambios) automjeti.tipi_kambios = tipi_kambios;
    if (kilometrazhi !== undefined) automjeti.kilometrazhi = kilometrazhi;
    if (cmimi_ditor !== undefined) automjeti.cmimi_ditor = cmimi_ditor;
    if (foto_url !== undefined) automjeti.foto_url = foto_url;
    if (statusi) automjeti.statusi = statusi;

    await automjeti.save();

    res.json({
      sukses: true,
      mesazh: 'Automjeti u përditësua me sukses',
      te_dhena: automjeti
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/automjete/:id — Fshi automjetin (vetëm admin)
 */
const fshi = async (req, res, next) => {
  try {
    const automjeti = await Automjet.findByPk(req.params.id);
    if (!automjeti) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Automjeti nuk u gjet'
      });
    }

    // Kontrollo nëse ka qiradhënie aktive
    const qiraAktive = await Qiradhenie.count({
      where: { automjet_id: automjeti.id, statusi: 'aktive' }
    });

    if (qiraAktive > 0) {
      return res.status(400).json({
        sukses: false,
        mesazh: 'Nuk mund të fshihet automjeti pasi ka qiradhënie aktive'
      });
    }

    await automjeti.destroy();

    res.json({
      sukses: true,
      mesazh: 'Automjeti u fshi me sukses'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { lista, detajet, krijo, perditeso, fshi };
