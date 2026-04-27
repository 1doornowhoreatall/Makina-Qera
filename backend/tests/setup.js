const { sequelize } = require('../src/models');

// Konfigurimi i mjedisit të testimit
beforeAll(async () => {
  // Sinkronizo bazën e të dhënave për teste
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Mbyll lidhjen me bazën e të dhënave
  await sequelize.close();
});
