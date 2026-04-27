const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Qiradhenie = sequelize.define('Qiradhenie', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    automjet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'automjetet',
        key: 'id'
      }
    },
    klient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'perdoruesit',
        key: 'id'
      }
    },
    data_terheqjes: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Data e tërheqjes nuk është e vlefshme' }
      }
    },
    vendi_terheqjes: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Vendi i tërheqjes është i detyrueshëm' }
      }
    },
    data_dorezimit: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Data e dorëzimit nuk është e vlefshme' },
        pasDataTerheqjes(value) {
          if (new Date(value) <= new Date(this.data_terheqjes)) {
            throw new Error('Data e dorëzimit duhet të jetë pas datës së tërheqjes');
          }
        }
      }
    },
    vendi_dorezimit: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Vendi i dorëzimit është i detyrueshëm' }
      }
    },
    shenime_gjendjeje: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    statusi: {
      type: DataTypes.ENUM('aktive', 'perfunduar', 'anuluar'),
      defaultValue: 'aktive',
      allowNull: false
    },
    cmimi_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  }, {
    tableName: 'qiradheniet'
  });

  /**
   * Llogarit numrin e ditëve të qiradhënies
   */
  Qiradhenie.prototype.ditetQirase = function () {
    const fillimi = new Date(this.data_terheqjes);
    const mbarimi = new Date(this.data_dorezimit);
    return Math.ceil((mbarimi - fillimi) / (1000 * 60 * 60 * 24));
  };

  return Qiradhenie;
};
