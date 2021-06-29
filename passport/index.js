const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const tUser = require('../models/tUser');

module.exports = () => {
  passport.serializeUser((user, done) => {
    console.log(user.id);
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    tUser
      .findOne({
        where: { id: id },
      })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local();
};
