const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    define: config.define,
    pool: config.pool || {}
  }
);

// Importo modelet
const User = require('./User')(sequelize);
const Automjet = require('./Automjet')(sequelize);
const Sigurim = require('./Sigurim')(sequelize);
const Qiradhenie = require('./Qiradhenie')(sequelize);
const Njoftim = require('./Njoftim')(sequelize);

// Asociacionet (lidhjet midis tabelave)

// Automjet <-> Sigurim (1:N)
Automjet.hasMany(Sigurim, {
  foreignKey: 'automjet_id',
  as: 'sigurimet',
  onDelete: 'CASCADE'
});
Sigurim.belongsTo(Automjet, {
  foreignKey: 'automjet_id',
  as: 'automjeti'
});

// Automjet <-> Qiradhenie (1:N)
Automjet.hasMany(Qiradhenie, {
  foreignKey: 'automjet_id',
  as: 'qiradheniet',
  onDelete: 'RESTRICT'
});
Qiradhenie.belongsTo(Automjet, {
  foreignKey: 'automjet_id',
  as: 'automjeti'
});

// User (Klient) <-> Qiradhenie (1:N)
User.hasMany(Qiradhenie, {
  foreignKey: 'klient_id',
  as: 'qiradheniet',
  onDelete: 'RESTRICT'
});
Qiradhenie.belongsTo(User, {
  foreignKey: 'klient_id',
  as: 'klienti'
});

// User <-> Njoftim (1:N)
User.hasMany(Njoftim, {
  foreignKey: 'user_id',
  as: 'njoftimet',
  onDelete: 'CASCADE'
});
Njoftim.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'perdoruesi'
});

module.exports = {
  sequelize,
  Sequelize,
  User,
  Automjet,
  Sigurim,
  Qiradhenie,
  Njoftim
};
