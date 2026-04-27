const { Op, fn, col, literal } = require('sequelize');
const { Automjet, Sigurim, Qiradhenie, User, sequelize } = require('../models');

/**
 * GET /api/raporte/statistika — Statistika të përgjithshme (Dashboard)
 */
const statistika = async (req, res, next) => {
  try {
    const totaliAutomjeteve = await Automjet.count();
    const automjeteAktive = await Automjet.count({ where: { statusi: 'aktiv' } });
    const totaliKlienteve = await User.count({ where: { roli: 'klient' } });
    const qiraDhenieAktive = await Qiradhenie.count({ where: { statusi: 'aktive' } });
    const qiraDheniePerfunduara = await Qiradhenie.count({ where: { statusi: 'perfunduar' } });

    // Të ardhura totale
    const teArdhurat = await Qiradhenie.sum('cmimi_total', {
      where: { statusi: { [Op.in]: ['aktive', 'perfunduar'] } }
    });

    // Sigurime që skadojnë brenda 30 ditëve
    const sot = new Date();
    const pas30Diteve = new Date();
    pas30Diteve.setDate(pas30Diteve.getDate() + 30);

    const sigurimeQeSkadojne = await Sigurim.count({
      where: {
        data_mbarimit: { [Op.between]: [sot, pas30Diteve] }
      }
    });

    // Sigurime të skaduara
    const sigurimeSkaduara = await Sigurim.count({
      where: {
        data_mbarimit: { [Op.lt]: sot }
      }
    });

    res.json({
      sukses: true,
      te_dhena: {
        automjete: {
          totali: totaliAutomjeteve,
          aktive: automjeteAktive,
          jashte_perdorimit: totaliAutomjeteve - automjeteAktive
        },
        kliente: {
          totali: totaliKlienteve
        },
        qiradhenie: {
          aktive: qiraDhenieAktive,
          perfunduara: qiraDheniePerfunduara,
          te_ardhurat_totale: parseFloat(teArdhurat || 0)
        },
        sigurime: {
          qe_skadojne_30_dite: sigurimeQeSkadojne,
          te_skaduara: sigurimeSkaduara
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/raporte/perdorimi — Raporti i përdorimit të automjeteve
 */
const raportiPerdorimit = async (req, res, next) => {
  try {
    const automjetet = await Automjet.findAll({
      include: [{
        model: Qiradhenie,
        as: 'qiradheniet',
        attributes: ['id', 'data_terheqjes', 'data_dorezimit', 'statusi', 'cmimi_total']
      }],
      order: [['modeli', 'ASC']]
    });

    const raport = automjetet.map(auto => {
      const qiraTotale = auto.qiradheniet.length;
      const qiraAktive = auto.qiradheniet.filter(q => q.statusi === 'aktive').length;
      const teArdhurat = auto.qiradheniet
        .filter(q => q.statusi !== 'anuluar')
        .reduce((sum, q) => sum + parseFloat(q.cmimi_total || 0), 0);

      // Llogarit ditët totale të qirasë
      const diteTotale = auto.qiradheniet
        .filter(q => q.statusi !== 'anuluar')
        .reduce((sum, q) => {
          const dite = Math.ceil(
            (new Date(q.data_dorezimit) - new Date(q.data_terheqjes)) / (1000 * 60 * 60 * 24)
          );
          return sum + dite;
        }, 0);

      return {
        id: auto.id,
        targa: auto.targa,
        modeli: auto.modeli,
        statusi: auto.statusi,
        qira_totale: qiraTotale,
        qira_aktive: qiraAktive,
        dite_totale_qira: diteTotale,
        te_ardhura_totale: Math.round(teArdhurat * 100) / 100
      };
    });

    res.json({
      sukses: true,
      te_dhena: raport
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/raporte/sigurime — Raporti i sigurimeve
 */
const raportiSigurimeve = async (req, res, next) => {
  try {
    const sot = new Date();
    const pas30Diteve = new Date();
    pas30Diteve.setDate(pas30Diteve.getDate() + 30);

    // Grupimi sipas statusit
    const aktive = await Sigurim.findAll({
      where: {
        data_fillimit: { [Op.lte]: sot },
        data_mbarimit: { [Op.gte]: sot }
      },
      include: [{ model: Automjet, as: 'automjeti', attributes: ['targa', 'modeli'] }],
      order: [['data_mbarimit', 'ASC']]
    });

    const qeSkadojne = await Sigurim.findAll({
      where: {
        data_mbarimit: { [Op.between]: [sot, pas30Diteve] }
      },
      include: [{ model: Automjet, as: 'automjeti', attributes: ['targa', 'modeli'] }],
      order: [['data_mbarimit', 'ASC']]
    });

    const skaduara = await Sigurim.findAll({
      where: {
        data_mbarimit: { [Op.lt]: sot }
      },
      include: [{ model: Automjet, as: 'automjeti', attributes: ['targa', 'modeli'] }],
      order: [['data_mbarimit', 'DESC']],
      limit: 20
    });

    // Kosto totale
    const kostoTotale = await Sigurim.sum('kosto');

    res.json({
      sukses: true,
      te_dhena: {
        aktive: { lista: aktive, totali: aktive.length },
        qe_skadojne: { lista: qeSkadojne, totali: qeSkadojne.length },
        te_skaduara: { lista: skaduara, totali: skaduara.length },
        kosto_totale: parseFloat(kostoTotale || 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { statistika, raportiPerdorimit, raportiSigurimeve };
