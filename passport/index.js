const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const tUser = require('../models/tUser');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    tUser
      .findOne({
        where: { id },
      })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  kakao();
  local();
};
