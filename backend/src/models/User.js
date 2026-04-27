const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    emri: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Emri nuk mund të jetë bosh' },
        len: { args: [2, 100], msg: 'Emri duhet të ketë 2-100 karaktere' }
      }
    },
    mbiemri: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Mbiemri nuk mund të jetë bosh' },
        len: { args: [2, 100], msg: 'Mbiemri duhet të ketë 2-100 karaktere' }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'Ky email është i regjistruar tashmë' },
      validate: {
        isEmail: { msg: 'Formati i email-it nuk është i vlefshëm' }
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    datelindja: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Data e lindjes nuk është e vlefshme' },
        moshaMinimale(value) {
          const sot = new Date();
          const datelindja = new Date(value);
          let mosha = sot.getFullYear() - datelindja.getFullYear();
          const m = sot.getMonth() - datelindja.getMonth();
          if (m < 0 || (m === 0 && sot.getDate() < datelindja.getDate())) {
            mosha--;
          }
          if (mosha < 18) {
            throw new Error('Mosha minimale për regjistrim është 18 vjeç');
          }
        }
      }
    },
    nr_personal: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: { msg: 'Ky numër personal është i regjistruar tashmë' },
      validate: {
        notEmpty: { msg: 'Numri personal i identifikimit është i detyrueshëm' }
      }
    },
    telefoni: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Numri i telefonit është i detyrueshëm' }
      }
    },
    roli: {
      type: DataTypes.ENUM('admin', 'klient'),
      defaultValue: 'klient',
      allowNull: false
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'perdoruesit',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, authConfig.bcryptRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, authConfig.bcryptRounds);
        }
      }
    }
  });

  /**
   * Verifikon fjalëkalimin
   */
  User.prototype.verifikoPassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  /**
   * Kthen emrin e plotë
   */
  User.prototype.emriPlote = function () {
    return `${this.emri} ${this.mbiemri}`;
  };

  /**
   * Fshin fushat e ndjeshme kur kthehet si JSON
   */
  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.verification_token;
    return values;
  };

  return User;
};
