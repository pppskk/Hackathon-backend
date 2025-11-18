const { DataTypes } = require("sequelize");
const { sequelize } = require("../function/postgre");
const Plot = require("./plots");

const YieldHistory = sequelize.define("yield_history", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  plot_id: {
    type: DataTypes.INTEGER,
    references: { model: Plot, key: "plot_id" }
  },
  year: { type: DataTypes.INTEGER, allowNull: false },
  yield_kg: { type: DataTypes.FLOAT, allowNull: false }
}, {
  timestamps: false
});

YieldHistory.belongsTo(Plot, { foreignKey: "plot_id" });

module.exports = YieldHistory;
