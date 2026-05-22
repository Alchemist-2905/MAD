const sequelize = require('c:/Users/aksha/Desktop/MAD/backend/config/database');

async function checkRaw() {
  try {
    await sequelize.authenticate();
    const [results1] = await sequelize.query("SELECT createdAt FROM BehavioralMetrics WHERE createdAt NOT LIKE '%+00:00%' LIMIT 10");
    console.log('Metrics without +00:00:', results1);
    
    const [results2] = await sequelize.query("SELECT createdAt FROM Habits LIMIT 5");
    console.log('Habits createdAt:', results2);
    
    const [results3] = await sequelize.query("SELECT createdAt FROM Users LIMIT 5");
    console.log('Users createdAt:', results3);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRaw();
