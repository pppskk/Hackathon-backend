const { DataTypes } = require('sequelize');
const { sequelize } = require('../function/postgre');
const TransactionType = require('./transactionType');

const TransactionCategory = sequelize.define('transaction_categories', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type_id: { type: DataTypes.INTEGER, references: { model: TransactionType, key: 'id' } },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
}, { timestamps: false });

TransactionType.hasMany(TransactionCategory, { foreignKey: 'type_id' });
TransactionCategory.belongsTo(TransactionType, { foreignKey: 'type_id' });

module.exports = TransactionCategory;
