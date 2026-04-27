require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');
const SigurimService = require('./src/services/sigurimService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Testo lidhjen me bazën e të dhënave
    await sequelize.authenticate();
    console.log('✅ Lidhja me bazën e të dhënave u krye me sukses');

    // Sinkronizo modelet (në dev mode krijo tabelat)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelet u sinkronizuan me bazën e të dhënave');
    }

    // Starto cron job për kontrollin e sigurimeve
    if (process.env.NODE_ENV !== 'test') {
      SigurimService.startoCronJob();
    }

    // Starto serverin
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚗  MAKINA QERA — Serveri u startua!           ║
║                                                   ║
║   🌐  URL:  http://localhost:${PORT}               ║
║   📖  API:  http://localhost:${PORT}/api-docs      ║
║   🔧  Mjedisi: ${process.env.NODE_ENV || 'development'}                    ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Gabim gjatë startimit të serverit:', error);
    process.exit(1);
  }
};

startServer();
