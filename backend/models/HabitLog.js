const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HabitLog = sequelize.define('HabitLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY, // Stores date as YYYY-MM-DD
    allowNull: false,
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  habitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = HabitLog;
