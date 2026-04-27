const { Njoftim } = require('../models');

/**
 * GET /api/njoftimet — Lista e njoftimeve të përdoruesit
 */
const lista = async (req, res, next) => {
  try {
    const { lexuar, faqe = 1, per_faqe = 20 } = req.query;
    const where = { user_id: req.user.id };

    if (lexuar !== undefined) {
      where.lexuar = lexuar === 'true';
    }

    const offset = (parseInt(faqe) - 1) * parseInt(per_faqe);

    const { count, rows } = await Njoftim.findAndCountAll({
      where,
      order: [['krijuar_me', 'DESC']],
      limit: parseInt(per_faqe),
      offset
    });

    // Numro njoftimet e palexuara
    const palexuara = await Njoftim.count({
      where: { user_id: req.user.id, lexuar: false }
    });

    res.json({
      sukses: true,
      te_dhena: {
        njoftimet: rows,
        totali: count,
        palexuara,
        faqe: parseInt(faqe),
        faqe_totale: Math.ceil(count / parseInt(per_faqe))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/njoftimet/:id/lexo — Shëno njoftimin si të lexuar
 */
const shenioLexuar = async (req, res, next) => {
  try {
    const njoftimi = await Njoftim.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!njoftimi) {
      return res.status(404).json({
        sukses: false,
        mesazh: 'Njoftimi nuk u gjet'
      });
    }

    njoftimi.lexuar = true;
    await njoftimi.save();

    res.json({
      sukses: true,
      mesazh: 'Njoftimi u shënua si i lexuar'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/njoftimet/lexo-te-gjitha — Shëno të gjitha si të lexuara
 */
const lexoTeGjitha = async (req, res, next) => {
  try {
    await Njoftim.update(
      { lexuar: true },
      { where: { user_id: req.user.id, lexuar: false } }
    );

    res.json({
      sukses: true,
      mesazh: 'Të gjitha njoftimet u shënuan si të lexuara'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { lista, shenioLexuar, lexoTeGjitha };
