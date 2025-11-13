const { DataTypes } = require('sequelize');
const { sequelize } = require('../function/postgre');
const User = require('./users');

const Plant = sequelize.define('plants', {
  plant_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  plant_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = Plant;
