const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BehavioralMetric = sequelize.define('BehavioralMetric', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow anonymous metrics or map to logged-in users
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'click', 'page_view', 'session_duration', 'habit_toggle'
  },
  elementId: {
    type: DataTypes.STRING,
    allowNull: true, // ID of button or view
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true, // Details like screen width, duration in seconds, or tab name
  },
});

module.exports = BehavioralMetric;
