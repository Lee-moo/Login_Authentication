const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const tUser = require('../models/tUser');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'user_id',
        passwordField: 'password',
      },
      async (user_id, password, done) => {
        try {
          const user = await tUser.findOne({ where: { user_id } });

          if (user) {
            const pwdCompare = await bcrypt.compare(password, user.password);
            if (pwdCompare) {
              done(null, user);
            } else {
              done(null, false, { message: '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.' });
            }
          } else {
            done(null, false, { message: '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.' });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
