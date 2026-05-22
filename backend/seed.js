const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const { User, Habit, HabitLog, BehavioralMetric } = require('./models');

async function seedData() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful. Syncing models...');
    await sequelize.sync({ force: true });

    // 1. Create or verify Presenter account
    const presenterEmail = 'demo@habitai.com';
    const presenterUsername = 'DemoPresenter';
    const rawPassword = 'password123';

    // Delete existing presenter user to clean state
    const existingUser = await User.findOne({ where: { email: presenterEmail } });
    if (existingUser) {
      console.log('Cleaning existing presenter records...');
      await existingUser.destroy();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const user = await User.create({
      username: presenterUsername,
      email: presenterEmail,
      password: hashedPassword,
    });
    console.log(`Presenter account created: ${presenterEmail} / ${rawPassword}`);

    // 2. Generate past dates (last 7 days including today)
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    const [today, yesterday, day2, day3, day4, day5, day6] = dates;

    // 3. Create habits
    const h1 = await Habit.create({
      name: 'Drink 8 Glasses of Water',
      description: 'Stay hydrated to maintain cognitive performance and cell structure.',
      category: 'Health',
      frequency: 'Daily',
      userId: user.id,
    });

    const h2 = await Habit.create({
      name: 'Read 15 Pages',
      description: 'Read technical books, literature, or psychology to build continuous intelligence.',
      category: 'Mind',
      frequency: 'Daily',
      userId: user.id,
    });

    const h3 = await Habit.create({
      name: 'Cardio Workout',
      description: 'Run, bike, or swim for 30 minutes to boost cardiovascular health.',
      category: 'Fitness',
      frequency: 'Daily',
      userId: user.id,
    });

    const h4 = await Habit.create({
      name: 'Review Daily Expense Logs',
      description: 'Check credit lists and maintain a daily cost balance sheet.',
      category: 'Finance',
      frequency: 'Daily',
      userId: user.id,
    });

    console.log('Habits created.');

    // 4. Create completions
    // Habit 1: Health (5 / 7 logs)
    await HabitLog.bulkCreate([
      { habitId: h1.id, date: today, completed: true },
      { habitId: h1.id, date: yesterday, completed: true },
      { habitId: h1.id, date: day3, completed: true },
      { habitId: h1.id, date: day4, completed: true },
      { habitId: h1.id, date: day6, completed: true },
    ]);

    // Habit 2: Mind (7 / 7 logs - 100% streak!)
    await HabitLog.bulkCreate([
      { habitId: h2.id, date: today, completed: true },
      { habitId: h2.id, date: yesterday, completed: true },
      { habitId: h2.id, date: day2, completed: true },
      { habitId: h2.id, date: day3, completed: true },
      { habitId: h2.id, date: day4, completed: true },
      { habitId: h2.id, date: day5, completed: true },
      { habitId: h2.id, date: day6, completed: true },
    ]);

    // Habit 3: Fitness (2 / 7 logs)
    await HabitLog.bulkCreate([
      { habitId: h3.id, date: yesterday, completed: true },
      { habitId: h3.id, date: day4, completed: true },
    ]);

    // Habit 4: Finance (1 / 7 logs)
    await HabitLog.bulkCreate([
      { habitId: h4.id, date: day2, completed: true },
    ]);

    console.log('Habits log completions seeded.');

    // 5. Create Behavioral Metrics (IoB Telemetry)
    await BehavioralMetric.bulkCreate([
      // Page Views
      { userId: user.id, eventType: 'page_view', elementId: 'dashboard_main', value: 'session_start' },
      { userId: user.id, eventType: 'page_view', elementId: 'ai_advisor_screen', value: 'view' },
      { userId: user.id, eventType: 'page_view', elementId: 'iob_analytics_screen', value: 'view' },
      
      // Navigation Clicks
      { userId: user.id, eventType: 'click', elementId: 'nav_tab_tracker', value: 'transition' },
      { userId: user.id, eventType: 'click', elementId: 'nav_tab_ai-advisor', value: 'transition' },
      { userId: user.id, eventType: 'click', elementId: 'nav_tab_iob-analytics', value: 'transition' },
      { userId: user.id, eventType: 'click', elementId: 'nav_tab_ai-advisor', value: 'transition' },
      
      // Action Clicks
      { userId: user.id, eventType: 'click', elementId: 'toggle_habit_day_bubble', value: `${h1.id}:${today}` },
      { userId: user.id, eventType: 'click', elementId: 'toggle_habit_day_bubble', value: `${h2.id}:${today}` },
      { userId: user.id, eventType: 'click', elementId: 'toggle_habit_day_bubble', value: `${h1.id}:${yesterday}` },
      { userId: user.id, eventType: 'click', elementId: 'toggle_habit_day_bubble', value: `${h2.id}:${yesterday}` },
      { userId: user.id, eventType: 'click', elementId: 'toggle_habit_day_bubble', value: `${h3.id}:${yesterday}` },
      { userId: user.id, eventType: 'click', elementId: 'toggle_habit_day_bubble', value: `${h2.id}:${day2}` },
      
      // AI queries
      { userId: user.id, eventType: 'click', elementId: 'request_ai_advice_button', value: 're-eval' },
      { userId: user.id, eventType: 'click', elementId: 'request_ai_advice_button', value: 're-eval' },
      
      // Session Durations
      { userId: user.id, eventType: 'session_duration', elementId: 'dashboard_main', value: '124' },
    ]);

    console.log('Behavioral metrics (IoB) seeded successfully.');
    console.log('==================================================');
    console.log('SEEDED DETAILS FOR PRESENTATION:');
    console.log(`Email:    ${presenterEmail}`);
    console.log(`Password: ${rawPassword}`);
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
