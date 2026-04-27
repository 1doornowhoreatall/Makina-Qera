const { Op } = require('sequelize');
const { Qiradhenie, Automjet, Sigurim } = require('../models');

/**
 * Shërbimi i Qiradhënies — Logjika e biznesit
 */
class QiraDhenieService {
  /**
   * Kontrollon nëse automjeti është i disponueshëm për periudhën e kërkuar
   * @param {number} automjetId - ID e automjetit
   * @param {Date} dataFillimit - Data e fillimit
   * @param {Date} dataMbarimit - Data e mbarimit
   * @param {number|null} perjashtoId - ID-ja e qiradhënies për ta përjashtuar (gjatë editimit)
   * @returns {Object} { disponueshem: boolean, mesazh: string }
   */
  static async kontrolloDisponueshmerine(automjetId, dataFillimit, dataMbarimit, perjashtoId = null) {
    // Kontrollo nëse automjeti ekziston dhe është aktiv
    const automjeti = await Automjet.findByPk(automjetId);
    if (!automjeti) {
      return { disponueshem: false, mesazh: 'Automjeti nuk u gjet' };
    }
    if (automjeti.statusi !== 'aktiv') {
      return { disponueshem: false, mesazh: 'Automjeti nuk është aktiv momentalisht' };
    }

    // Kontrollo për konflikte me qiradhënie ekzistuese
    const whereClause = {
      automjet_id: automjetId,
      statusi: 'aktive',
      [Op.or]: [
        {
          data_terheqjes: { [Op.between]: [dataFillimit, dataMbarimit] }
        },
        {
          data_dorezimit: { [Op.between]: [dataFillimit, dataMbarimit] }
        },
        {
          [Op.and]: [
            { data_terheqjes: { [Op.lte]: dataFillimit } },
            { data_dorezimit: { [Op.gte]: dataMbarimit } }
          ]
        }
      ]
    };

    // Përjashto qiradhënien aktuale gjatë editimit
    if (perjashtoId) {
      whereClause.id = { [Op.ne]: perjashtoId };
    }

    const konflikt = await Qiradhenie.findOne({ where: whereClause });

    if (konflikt) {
      return {
        disponueshem: false,
        mesazh: `Automjeti është i rezervuar nga ${new Date(konflikt.data_terheqjes).toLocaleDateString('sq-AL')} deri më ${new Date(konflikt.data_dorezimit).toLocaleDateString('sq-AL')}`
      };
    }

    return { disponueshem: true, mesazh: 'Automjeti është i disponueshëm' };
  }

  /**
   * Kontrollon nëse automjeti ka sigurim aktiv që mbulon periudhën e qiradhënies
   * @param {number} automjetId - ID e automjetit
   * @param {Date} dataFillimit - Data e fillimit
   * @param {Date} dataMbarimit - Data e mbarimit
   * @returns {Object} { siguruar: boolean, mesazh: string }
   */
  static async kontrolloSigurimin(automjetId, dataFillimit, dataMbarimit) {
    const sigurim = await Sigurim.findOne({
      where: {
        automjet_id: automjetId,
        data_fillimit: { [Op.lte]: dataFillimit },
        data_mbarimit: { [Op.gte]: dataMbarimit }
      }
    });

    if (!sigurim) {
      return {
        siguruar: false,
        mesazh: 'Automjeti nuk ka sigurim aktiv që mbulon periudhën e qiradhënies. Qiradhënia nuk lejohet.'
      };
    }

    return { siguruar: true, mesazh: 'Sigurimi është aktiv', sigurim };
  }

  /**
   * Llogarit çmimin total të qiradhënies
   * @param {number} automjetId - ID e automjetit
   * @param {Date} dataFillimit - Data e tërheqjes
   * @param {Date} dataMbarimit - Data e dorëzimit
   * @returns {number} Çmimi total
   */
  static async llogaritCmimin(automjetId, dataFillimit, dataMbarimit) {
    const automjeti = await Automjet.findByPk(automjetId);
    if (!automjeti) {
      throw new Error('Automjeti nuk u gjet');
    }

    const fillimi = new Date(dataFillimit);
    const mbarimi = new Date(dataMbarimit);
    const dite = Math.ceil((mbarimi - fillimi) / (1000 * 60 * 60 * 24));

    // Minimumi 1 ditë
    const ditePagueshme = Math.max(dite, 1);

    // Zbritje për qira afatgjatë
    let zbritje = 1.0;
    if (ditePagueshme >= 30) {
      zbritje = 0.8; // 20% zbritje për 30+ ditë
    } else if (ditePagueshme >= 14) {
      zbritje = 0.9; // 10% zbritje për 14+ ditë
    } else if (ditePagueshme >= 7) {
      zbritje = 0.95; // 5% zbritje për 7+ ditë
    }

    const cmimiTotal = parseFloat(automjeti.cmimi_ditor) * ditePagueshme * zbritje;
    return Math.round(cmimiTotal * 100) / 100;
  }
}

module.exports = QiraDhenieService;
