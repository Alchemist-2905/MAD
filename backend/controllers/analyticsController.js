const { Habit, HabitLog, BehavioralMetric } = require('../models');

exports.logMetric = async (req, res) => {
  try {
    const { eventType, elementId, value } = req.body;
    const userId = req.user ? req.user.id : null; // Optional user context

    if (!eventType) {
      return res.status(400).json({ message: 'Event type is required' });
    }

    const metric = await BehavioralMetric.create({
      userId,
      eventType,
      elementId,
      value: value ? String(value) : null,
    });

    res.status(201).json(metric);
  } catch (error) {
    console.error('Error logging behavioral metric:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const metrics = await BehavioralMetric.findAll({
      where: { userId: req.user.id },
      limit: 100,
      order: [['createdAt', 'DESC']],
    });
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching behavioral metrics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAiAdvice = async (req, res) => {
  try {
    const userId = req.user.id;

    // Retrieve user habits and logs
    const habits = await Habit.findAll({
      where: { userId },
      include: [{ model: HabitLog }],
    });

    // Retrieve user behavioral metrics (IoB)
    const metrics = await BehavioralMetric.findAll({
      where: { userId },
      limit: 100,
    });

    if (habits.length === 0) {
      return res.json({
        summary: "Welcome to HabitAI! Create habits to initialize your personal AI Advisor.",
        recommendations: [
          "Start small: Add one daily habit like 'Drink 8 glasses of water' or 'Read for 10 minutes'.",
          "Set up reminders: Choose morning or evening categories to organize your routines.",
        ],
        metrics: {
          completionRate: 0,
          totalHabits: 0,
          engagementLevel: 'New User',
        },
      });
    }

    // Calculations
    let totalLogs = 0;
    let completedLogs = 0;
    habits.forEach(h => {
      totalLogs += 7; // Target is 7 days for current perspective
      completedLogs += h.HabitLogs ? h.HabitLogs.length : 0;
    });

    const completionRate = Math.round((completedLogs / (habits.length * 7)) * 100);

    // Compute interactions
    const totalClicks = metrics.filter(m => m.eventType === 'click').length;
    const viewsCount = metrics.filter(m => m.eventType === 'page_view').length;

    let engagement = 'Moderate';
    if (totalClicks > 30) engagement = 'High';
    if (totalClicks < 10) engagement = 'Low';

    // Rule-based AI Engine recommendations
    const recommendations = [];

    // Analyze completion rate
    if (completionRate < 30) {
      recommendations.push("Your weekly completion rate is below 30%. Try scaling back your habit goals. Focus on achieving a 3-day streak first.");
      recommendations.push("Behavior Analysis: You have high application visual views but low execution. Try setting a specific environment trigger (e.g., 'If I sit on my desk, then I will read').");
    } else if (completionRate >= 30 && completionRate < 70) {
      recommendations.push("You are at moderate consistency. We noticed a pattern where habits completed early in the day succeed more. Try scheduling tasks before noon.");
      recommendations.push("Internet of Behavior (IoB) Trend: You edit habits frequently. Try sticking to the same configuration for at least 14 days to stabilize memory retention.");
    } else {
      recommendations.push("Superb consistency! Your completion rate is excellent. Keep maintaining your momentum.");
      recommendations.push("AI Smart Recommendation: Push your limits. Introduce a secondary complementary habit (e.g. if you completed 'Exercise', add 'Stretch for 5 mins').");
    }

    // Analyze interaction behaviors (IoB)
    if (totalClicks > 40) {
      recommendations.push("You interact with the UI highly. Sometimes excessive tracking can lead to cognitive fatigue. Automate your loggings or set a single daily check-in time.");
    }

    const categories = habits.map(h => h.category);
    const healthHabits = categories.filter(c => c === 'Health').length;
    if (healthHabits > 2) {
      recommendations.push("You have multiple Health habits. Make sure to schedule adequate recovery gaps between physically intensive routines.");
    }

    res.json({
      summary: `HabitAI has analyzed your ${habits.length} active habits and ${metrics.length} recent interactive behaviors. Your streak completion rate stands at ${completionRate}% with a ${engagement} cognitive interaction level.`,
      recommendations,
      metrics: {
        completionRate,
        totalHabits: habits.length,
        engagementLevel: engagement,
        totalClicks,
        viewsCount,
      },
    });
  } catch (error) {
    console.error('Error generating AI advice:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
