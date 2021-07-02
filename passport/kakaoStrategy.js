const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const tUser = require('../models/tUser');

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: `${process.env.KAKAO_CALLBACK}`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await tUser.findOne({
            where: { user_id: profile.id, provider: '2' },
          });
          if (user) {
            done(null, user);
          } else {
            const birthday = profile._json.kakao_account.birthday;

            const newUser = await tUser.create({
              user_id: profile.id,
              name: profile._json.properties.nickname,
              provider: '2',
              birthday: birthday.slice(0, 2) + '-' + birthday.slice(2, 4),
              gender: profile._json.kakao_account.gender === 'male' ? '1' : '2',
            });

            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
