const { DataTypes } = require("sequelize");
const { sequelize } = require("../function/postgre");
const TransactionCategory = require("./transactionCategory");
const ProductionRound = require("./productionRounds");
const User = require('./users');

const Transaction = sequelize.define(
  "transactions",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    round_id: {
      type: DataTypes.INTEGER,
      references: { model: ProductionRound, key: "round_id" },
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "user_id",
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      references: { model: TransactionCategory, key: "id" },
    },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    note: { type: DataTypes.TEXT },
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  },
  { timestamps: false }
);

Transaction.belongsTo(TransactionCategory, { foreignKey: "category_id" });
TransactionCategory.hasMany(Transaction, { foreignKey: "category_id" });

module.exports = Transaction;
