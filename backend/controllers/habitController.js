const { Habit, HabitLog } = require('../models');

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.findAll({
      where: { userId: req.user.id },
      include: [{ model: HabitLog }],
      order: [['createdAt', 'DESC']],
    });
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const { name, description, category, frequency } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    const newHabit = await Habit.create({
      name,
      description,
      category: category || 'General',
      frequency: frequency || 'Daily',
      userId: req.user.id,
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const { name, description, category, frequency } = req.body;
    const { id } = req.params;

    const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await habit.update({
      name: name !== undefined ? name : habit.name,
      description: description !== undefined ? description : habit.description,
      category: category !== undefined ? category : habit.category,
      frequency: frequency !== undefined ? frequency : habit.frequency,
    });

    res.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await habit.destroy();
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.toggleHabitLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body; // YYYY-MM-DD format

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Verify ownership
    const habit = await Habit.findOne({ where: { id, userId: req.user.id } });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Toggle logic: delete if exists, create if not
    const existingLog = await HabitLog.findOne({
      where: { habitId: id, date },
    });

    if (existingLog) {
      await existingLog.destroy();
      return res.json({ completed: false, message: 'Habit log deleted' });
    } else {
      const newLog = await HabitLog.create({
        habitId: id,
        date,
        completed: true,
      });
      return res.json({ completed: true, log: newLog, message: 'Habit log created' });
    }
  } catch (error) {
    console.error('Error toggling habit log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
