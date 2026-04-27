const cron = require('node-cron');
const { Op } = require('sequelize');
const { Sigurim, Automjet, User, Njoftim } = require('../models');
const { dergoParalajmerimSigurim } = require('../utils/email');

/**
 * Shërbimi i Sigurimeve — Kontrolle automatike dhe njoftimet
 */
class SigurimService {
  /**
   * Gjen sigurimet që skadojnë brenda X ditëve
   * @param {number} dite - Numri i ditëve (default 30)
   */
  static async gjejSiguriQeSkadonjne(dite = 30) {
    const sot = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dite);

    return await Sigurim.findAll({
      where: {
        data_mbarimit: {
          [Op.between]: [sot, dataLimite]
        }
      },
      include: [{
        model: Automjet,
        as: 'automjeti',
        attributes: ['id', 'targa', 'modeli']
      }],
      order: [['data_mbarimit', 'ASC']]
    });
  }

  /**
   * Gjen sigurimet e skaduara
   */
  static async gjejSigurimeSkaduara() {
    const sot = new Date();
    return await Sigurim.findAll({
      where: {
        data_mbarimit: { [Op.lt]: sot }
      },
      include: [{
        model: Automjet,
        as: 'automjeti',
        attributes: ['id', 'targa', 'modeli']
      }],
      order: [['data_mbarimit', 'DESC']]
    });
  }

  /**
   * Kontrollon nëse automjeti ka sigurim aktiv
   * @param {number} automjetId
   * @returns {boolean}
   */
  static async kaSigurimAktiv(automjetId) {
    const sot = new Date();
    const sigurim = await Sigurim.findOne({
      where: {
        automjet_id: automjetId,
        data_fillimit: { [Op.lte]: sot },
        data_mbarimit: { [Op.gte]: sot }
      }
    });
    return !!sigurim;
  }

  /**
   * Starton kontrollin automatik ditor për sigurime që skadojnë
   * Ekzekutohet çdo ditë në orën 08:00
   */
  static startoCronJob() {
    cron.schedule('0 8 * * *', async () => {
      console.log('🔄 Duke kontrolluar sigurimet që skadojnë...');
      try {
        // Gje sigurimet që skadojnë brenda 30 ditëve
        const sigurimet = await SigurimService.gjejSiguriQeSkadonjne(30);

        if (sigurimet.length > 0) {
          console.log(`⚠️ ${sigurimet.length} sigurime skadojnë brenda 30 ditëve`);

          // Gje administratorët për njoftim
          const adminet = await User.findAll({
            where: { roli: 'admin' }
          });

          for (const sigurim of sigurimet) {
            // Krijo njoftim in-app për çdo admin
            for (const admin of adminet) {
              await Njoftim.findOrCreate({
                where: {
                  user_id: admin.id,
                  tipi: 'sigurim',
                  titulli: `Sigurimi skadon: ${sigurim.automjeti?.targa || 'N/A'}`
                },
                defaults: {
                  mesazhi: `Sigurimi i automjetit ${sigurim.automjeti?.targa} (${sigurim.automjeti?.modeli}) nga ${sigurim.emri_shoqerise} skadon më ${new Date(sigurim.data_mbarimit).toLocaleDateString('sq-AL')}.`,
                  lexuar: false
                }
              });

              // Dërgo email paralajmërimi
              await dergoParalajmerimSigurim(admin.email, {
                targa: sigurim.automjeti?.targa,
                emri_shoqerise: sigurim.emri_shoqerise,
                data_mbarimit: new Date(sigurim.data_mbarimit).toLocaleDateString('sq-AL')
              });
            }
          }
        } else {
          console.log('✅ Asnjë sigurim nuk skadon brenda 30 ditëve');
        }
      } catch (error) {
        console.error('❌ Gabim gjatë kontrollimit të sigurimeve:', error.message);
      }
    });
    console.log('⏰ Cron job për kontrollin e sigurimeve u aktivizua (çdo ditë 08:00)');
  }
}

module.exports = SigurimService;
