const sequelize = require('c:/Users/aksha/Desktop/MAD/backend/config/database');
const { BehavioralMetric } = require('c:/Users/aksha/Desktop/MAD/backend/models');

async function testInsert() {
  try {
    await sequelize.authenticate();
    const newMetric = await BehavioralMetric.create({
      eventType: 'click',
      elementId: 'test_element',
      value: 'test_val'
    });
    console.log('Created metric in JS:', newMetric.get({ plain: true }));
    
    // Check raw SQL representation
    const [raw] = await sequelize.query(`SELECT createdAt FROM BehavioralMetrics WHERE id = ${newMetric.id}`);
    console.log('Raw DB createdAt value:', raw[0]);
    
    // Clean up
    await newMetric.destroy();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testInsert();
