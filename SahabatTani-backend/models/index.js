const User = require('./User');
const Detection = require('./Detection');

User.hasMany(Detection, {
  foreignKey: 'user_id',
  as: 'detections'
});

Detection.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = {
  User,
  Detection
};