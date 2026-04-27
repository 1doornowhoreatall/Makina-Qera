const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Njoftim = sequelize.define('Njoftim', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'perdoruesit',
        key: 'id'
      }
    },
    tipi: {
      type: DataTypes.ENUM('rezervim', 'sigurim', 'sistem', 'paralajmerim'),
      allowNull: false,
      defaultValue: 'sistem'
    },
    titulli: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mesazhi: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    lexuar: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'njoftimet'
  });

  return Njoftim;
};
