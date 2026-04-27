const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sigurim = sequelize.define('Sigurim', {
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
    emri_shoqerise: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Emri i shoqërisë së sigurimit është i detyrueshëm' }
      }
    },
    data_fillimit: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Data e fillimit nuk është e vlefshme' }
      }
    },
    data_mbarimit: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Data e mbarimit nuk është e vlefshme' },
        pasDataFillimit(value) {
          if (new Date(value) <= new Date(this.data_fillimit)) {
            throw new Error('Data e mbarimit duhet të jetë pas datës së fillimit');
          }
        }
      }
    },
    kosto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'Kosto duhet të jetë numër' },
        min: { args: [0], msg: 'Kosto nuk mund të jetë negative' }
      }
    }
  }, {
    tableName: 'sigurimet'
  });

  /**
   * Kontrollon nëse sigurimi është aktiv (jo i skaduar)
   */
  Sigurim.prototype.eshteAktiv = function () {
    const sot = new Date();
    sot.setHours(0, 0, 0, 0);
    return new Date(this.data_fillimit) <= sot && new Date(this.data_mbarimit) >= sot;
  };

  /**
   * Kontrollon nëse sigurimi skadon brenda X ditëve
   */
  Sigurim.prototype.skadonSeshpejti = function (dite = 30) {
    const sot = new Date();
    const mbarimi = new Date(this.data_mbarimit);
    const diferenca = Math.ceil((mbarimi - sot) / (1000 * 60 * 60 * 24));
    return diferenca >= 0 && diferenca <= dite;
  };

  return Sigurim;
};
