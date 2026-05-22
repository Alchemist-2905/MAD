const User = require('./User');
const Habit = require('./Habit');
const HabitLog = require('./HabitLog');
const BehavioralMetric = require('./BehavioralMetric');

// Associations
User.hasMany(Habit, { foreignKey: 'userId', onDelete: 'CASCADE' });
Habit.belongsTo(User, { foreignKey: 'userId' });

Habit.hasMany(HabitLog, { foreignKey: 'habitId', onDelete: 'CASCADE' });
HabitLog.belongsTo(Habit, { foreignKey: 'habitId' });

User.hasMany(BehavioralMetric, { foreignKey: 'userId', onDelete: 'CASCADE' });
BehavioralMetric.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Habit,
  HabitLog,
  BehavioralMetric,
};
