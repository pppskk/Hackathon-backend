const { DataTypes } = require('sequelize');
const { sequelize } = require('../function/postgre');
const plants = require('./plants');
const User = require('./users');

const Plot = sequelize.define('plots', {
  plot_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  plant_id: {
    type: DataTypes.INTEGER,
    references: {
      model: plants,
      key: 'plant_id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  plot_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  area_size: {
    type: DataTypes.FLOAT
  }
}, {
  timestamps: false
});

module.exports = Plot;
