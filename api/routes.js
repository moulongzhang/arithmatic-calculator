module.exports = function (app) {
  const arithmetic = require('./controller');
  app.route('/arithmetic').get(arithmetic.calculate);
  app.route('/arithmetic/evaluate').get(arithmetic.evaluate);
};
