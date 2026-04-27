const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Automjet = sequelize.define('Automjet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    targa: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: { msg: 'Kjo targë ekziston tashmë në sistem' },
      validate: {
        notEmpty: { msg: 'Targa është e detyrueshme' }
      }
    },
    modeli: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Modeli i automjetit është i detyrueshëm' }
      }
    },
    viti_prodhimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Viti duhet të jetë numër i plotë' },
        min: { args: [1990], msg: 'Viti i prodhimit duhet të jetë pas 1990' },
        max: { args: [new Date().getFullYear() + 1], msg: 'Viti i prodhimit nuk është i vlefshëm' }
      }
    },
    nr_max_pasagjeresh: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        isInt: { msg: 'Numri i pasagjerëve duhet të jetë numër i plotë' },
        min: { args: [1], msg: 'Minimumi 1 pasagjer' },
        max: { args: [50], msg: 'Maksimumi 50 pasagjerë' }
      }
    },
    tipi_motorrit: {
      type: DataTypes.ENUM('benzinë', 'naftë', 'elektrik', 'hibrid'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['benzinë', 'naftë', 'elektrik', 'hibrid']],
          msg: 'Tipi i motorrit duhet të jetë: benzinë, naftë, elektrik, ose hibrid'
        }
      }
    },
    tipi_kambios: {
      type: DataTypes.ENUM('manuale', 'automatike'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['manuale', 'automatike']],
          msg: 'Tipi i kambios duhet të jetë: manuale ose automatike'
        }
      }
    },
    kilometrazhi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Kilometrazhi duhet të jetë numër i plotë' },
        min: { args: [0], msg: 'Kilometrazhi nuk mund të jetë negativ' }
      }
    },
    cmimi_ditor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 30.00,
      validate: {
        isDecimal: { msg: 'Çmimi ditor duhet të jetë numër' },
        min: { args: [0], msg: 'Çmimi nuk mund të jetë negativ' }
      }
    },
    foto_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    statusi: {
      type: DataTypes.ENUM('aktiv', 'ne_mirembajtje', 'jashte_perdorimit'),
      defaultValue: 'aktiv',
      allowNull: false
    }
  }, {
    tableName: 'automjetet'
  });

  return Automjet;
};
