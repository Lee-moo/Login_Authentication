const { sequelize } = require('./');

module.exports = () => {
  sequelize
    .sync({
      force: false,
    })
    .then(() => {
      console.log('DB connect');
    })
    .catch((err) => {
      console.error(err);
    });
};
