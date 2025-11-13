const { DataTypes } = require('sequelize');
const { sequelize } = require('../function/postgre');

const TransactionType = sequelize.define('transaction_types', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
}, { timestamps: false });

module.exports = TransactionType;
