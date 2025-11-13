const { DataTypes } = require('sequelize');
const { sequelize } = require('../function/postgre');
const productionRounds = require('./productionRounds');

const Transaction = sequelize.define('transactions', {
  transaction_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  round_id: {
    type: DataTypes.INTEGER,
    references: {
      model: productionRounds,
      key: 'round_id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = Transaction;
