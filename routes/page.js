const express = require('express');
const { isNotLoggedIn, isLoggedIn } = require('./middle');
const passport = require('passport');
const router = express.Router();
const tUser = require('../models/tUser');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
  res.render('main.html');
});

// sign up router

router.get('/sign', isNotLoggedIn, (req, res, next) => {
  res.render('sign.html');
});

router.post('/sign', async (req, res, next) => {
  const { id, pwd, name, yy, mm, dd, gender } = req.body;

  try {
    const user = await tUser.findOne({ where: { user_id: id } });

    if (user) {
      return res.status(200).json({ result: 0, data: '이미 존재하는 아이디 입니다.' });
    }
    const hash = await bcrypt.hash(pwd, 12);
    await tUser.create({
      user_id: id,
      password: hash,
      provider: '1',
      name,
      birthday: yy + '-' + mm + '-' + dd,
      gender,
    });
    return res.status(200).json({ result: 1, data: '회원가입이 되었습니다.' });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// my page router

router.get('/mypage', (req, res) => {
  res.render('mypage.html', {
    id: req.user.user_id,
    name: req.user.name,
    birthday: req.user.birthday,
    gender: req.user.gender === '1' ? '남' : '여',
  });
});

// login, logout router

router.post('/', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) {
      console.error(error);
      return next(error);
    }
    if (!user) {
      return res.status(403).json({
        error: info.message,
      });
    }

    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('http://localhost:3000/mypage');
    });
  })(req, res, next);
});

router.get('/kakao', isNotLoggedIn, passport.authenticate('kakao'));

router.get(
  '/oauth/kakao',
  passport.authenticate('kakao', {
    failureRedirect: '/',
  }),
  (req, res) => {
    res.redirect('http://localhost:3000/mypage');
  }
);

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();
  res.render('main.html');
});

module.exports = router;
