const { DataTypes } = require('sequelize');
const { sequelize } = require('../function/postgre');
const plots = require('./plots');

const ProductionRound = sequelize.define('production_rounds', {
  round_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  plot_id: {
    type: DataTypes.INTEGER,
    references: {
      model: plots,
      key: 'plot_id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  round_name: {
    type: DataTypes.STRING
  },
  start_date: {
    type: DataTypes.DATE
  },
  end_date: {
    type: DataTypes.DATE
  },
  yield_unit: {
    type: DataTypes.STRING
  },
  income_total: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  expense_total: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  profit_total: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.income_total - this.expense_total;
    }
  }
}, {
  timestamps: false
});

module.exports = ProductionRound;
