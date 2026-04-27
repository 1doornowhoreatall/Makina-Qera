const { Op } = require('sequelize');
const { Qiradhenie, Automjet, User, Njoftim } = require('../models');
const QiraDhenieService = require('../services/qiraDhenieService');
const { dergoKonfirmimRezerimi } = require('../utils/email');

/**
 * GET /api/qiradhenie — Lista e qiradhënieve
 */
const lista = async (req, res, next) => {
  try {
    const { statusi, automjet_id, klient_id, faqe = 1, per_faqe = 10 } = req.query;
    const where = {};

    if (statusi) where.statusi = statusi;
    if (automjet_id) where.automjet_id = automjet_id;

    // Klientët shohin vetëm qiradhëniet e tyre
    if (req.user.roli === 'klient') {
      where.klient_id = req.user.id;
    } else if (klient_id) {
      where.klient_id = klient_id;
    }

    const offset = (parseInt(faqe) - 1) * parseInt(per_faqe);

    const { count, rows } = await Qiradhenie.findAndCountAll({
      where,
      include: [
        {
          model: Automjet,
          as: 'automjeti',
          attributes: ['id', 'targa', 'modeli', 'viti_prodhimit', 'foto_url']
        },
        {
          model: User,
          as: 'klienti',
          attributes: ['id', 'emri', 'mbiemri', 'email', 'telefoni']
        }
      ],
      order: [['krijuar_me', 'DESC']],
      limit: parseInt(per_faqe),
      offset,
      distinct: true
    });

    res.json({
      sukses: true,
      te_dhena: {
        qiradheniet: rows,
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
 * GET /api/qiradhenie/:id — Detajet e qiradhënies
 */
const detajet = async (req, res, next) => {
  try {
    const where = { id: req.params.id };

    // Klientët mund të shohin vetëm qiradhëniet e tyre
    if (req.user.roli === 'klient') {
      where.klient_id = req.user.id;
    }

    const qiradhenie = await Qiradhenie.findOne({
      where,
      include: [
        {
          model: Automjet,
          as: 'automjeti'
        },
        {
          model: User,
          as: 'klienti',
          attributes: { exclude: ['password_hash', 'verification_token'] }
        }
      ]
    });

    if (!qiradhenie) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Qiradhënia nuk u gjet'
      });
    }

    res.json({
      sukses: true,
      te_dhena: qiradhenie
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/qiradhenie — Krijo qiradhënie të re
 */
const krijo = async (req, res, next) => {
  try {
    const {
      automjet_id, data_terheqjes, vendi_terheqjes,
      data_dorezimit, vendi_dorezimit, shenime_gjendjeje
    } = req.body;

    const klient_id = req.user.roli === 'klient' ? req.user.id : req.body.klient_id;

    if (!klient_id) {
      return res.status(400).json({
        sukses: false,
        mesazh: 'ID e klientit është e detyrueshme'
      });
    }

    // 1. Kontrollo disponueshmërinë
    const disponueshmeria = await QiraDhenieService.kontrolloDisponueshmerine(
      automjet_id, data_terheqjes, data_dorezimit
    );

    if (!disponueshmeria.disponueshem) {
      return res.status(400).json({
        sukses: false,
        mesazh: disponueshmeria.mesazh
      });
    }

    // 2. Kontrollo sigurimin
    const sigurimi = await QiraDhenieService.kontrolloSigurimin(
      automjet_id, data_terheqjes, data_dorezimit
    );

    if (!sigurimi.siguruar) {
      return res.status(400).json({
        sukses: false,
        mesazh: sigurimi.mesazh
      });
    }

    // 3. Llogarit çmimin
    const cmimi_total = await QiraDhenieService.llogaritCmimin(
      automjet_id, data_terheqjes, data_dorezimit
    );

    // 4. Krijo qiradhënien
    const qiradhenie = await Qiradhenie.create({
      automjet_id,
      klient_id,
      data_terheqjes,
      vendi_terheqjes,
      data_dorezimit,
      vendi_dorezimit,
      shenime_gjendjeje,
      cmimi_total,
      statusi: 'aktive'
    });

    // 5. Merr detajet e plota
    const qiraPershkruar = await Qiradhenie.findByPk(qiradhenie.id, {
      include: [
        { model: Automjet, as: 'automjeti' },
        { model: User, as: 'klienti', attributes: ['id', 'emri', 'mbiemri', 'email'] }
      ]
    });

    // 6. Krijo njoftim dhe dërgo email
    const klienti = await User.findByPk(klient_id);
    if (klienti) {
      await Njoftim.create({
        user_id: klient_id,
        tipi: 'rezervim',
        titulli: 'Rezervim i ri i konfirmuar',
        mesazhi: `Rezervimi juaj për automjetin ${qiraPershkruar.automjeti.targa} (${qiraPershkruar.automjeti.modeli}) u konfirmua me sukses. Data tërheqjes: ${new Date(data_terheqjes).toLocaleDateString('sq-AL')}`
      });

      await dergoKonfirmimRezerimi(klienti.email, {
        automjet: `${qiraPershkruar.automjeti.targa} - ${qiraPershkruar.automjeti.modeli}`,
        data_terheqjes: new Date(data_terheqjes).toLocaleDateString('sq-AL'),
        data_dorezimit: new Date(data_dorezimit).toLocaleDateString('sq-AL'),
        vendi_terheqjes
      });
    }

    res.status(201).json({
      sukses: true,
      mesazh: 'Qiradhënia u krijua me sukses',
      te_dhena: qiraPershkruar
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/qiradhenie/:id/statusi — Ndrysho statusin
 */
const ndryshStatuisin = async (req, res, next) => {
  try {
    const { statusi, shenime_gjendjeje } = req.body;

    const qiradhenie = await Qiradhenie.findByPk(req.params.id);
    if (!qiradhenie) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Qiradhënia nuk u gjet'
      });
    }

    if (statusi) qiradhenie.statusi = statusi;
    if (shenime_gjendjeje) qiradhenie.shenime_gjendjeje = shenime_gjendjeje;

    await qiradhenie.save();

    res.json({
      sukses: true,
      mesazh: 'Statusi i qiradhënies u përditësua',
      te_dhena: qiradhenie
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/qiradhenie/kontrollo-disponueshmerine — Kontrollo disponueshmërinë
 */
const kontrolloDisponueshmerine = async (req, res, next) => {
  try {
    const { automjet_id, data_fillimit, data_mbarimit } = req.query;

    if (!automjet_id || !data_fillimit || !data_mbarimit) {
      return res.status(400).json({
        sukses: false,
        mesazh: 'Kërkohen automjet_id, data_fillimit dhe data_mbarimit'
      });
    }

    const rezultati = await QiraDhenieService.kontrolloDisponueshmerine(
      parseInt(automjet_id), data_fillimit, data_mbarimit
    );

    let cmimi = null;
    if (rezultati.disponueshem) {
      cmimi = await QiraDhenieService.llogaritCmimin(
        parseInt(automjet_id), data_fillimit, data_mbarimit
      );
    }

    res.json({
      sukses: true,
      te_dhena: {
        ...rezultati,
        cmimi_total: cmimi
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { lista, detajet, krijo, ndryshStatuisin, kontrolloDisponueshmerine };
