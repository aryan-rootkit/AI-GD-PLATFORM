/**
 * Canonical Mongoose models for the AI Group Discussion Platform.
 * Use these in services/controllers when building on the core schema layer.
 *
 * Note: The running app may still use `server/src/models/*.model.js` adapters
 * with in-memory fallbacks until those are migrated to this layer.
 */
module.exports = {
  User: require('./User.model'),
  Session: require('./Session.model'),
  Message: require('./Message.model'),
  Evaluation: require('./Evaluation.model'),
  UserStats: require('./UserStats.model'),
};
