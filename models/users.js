const { DataTypes } = require('sequelize');
const { sequelize } = require('../function/postgre');

const User = sequelize.define('users', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
    unique: true
  },
  userPicture: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false
});

module.exports = User;
