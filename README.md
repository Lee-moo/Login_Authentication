<h2 align="center">Login Authentication 🔥</h2>
<p>
  <img src="https://img.shields.io/badge/version-1.0.0-informational" alt="version">
  <a href="#" target="_blank">
  <img src="https://img.shields.io/badge/License-MIT-blueviolet" alt="License">
  </a>
</p>

<h2>🔧 디렉토리 구조</h2>

```shell
📦login_authentication
 ┣ 📂CSS
 ┃ ┣ 📜default.css
 ┃ ┣ 📜join.css
 ┃ ┣ 📜main.css
 ┃ ┗ 📜mypage.css
 ┣ 📂images
 ┃ ┣ 📜kakao.png
 ┃ ┗ 📜naver.png
 ┣ 📂models
 ┃ ┣ 📜index.js
 ┃ ┣ 📜initialize.js
 ┃ ┗ 📜tUser.js
 ┣ 📂passport
 ┃ ┣ 📜index.js
 ┃ ┣ 📜kakaoStrategy.js
 ┃ ┗ 📜localStrategy.js
 ┣ 📂routes
 ┃ ┣ 📜middle.js
 ┃ ┗ 📜page.js
 ┣ 📂views
 ┃ ┣ 📜error.html
 ┃ ┣ 📜main.html
 ┃ ┣ 📜mypage.html
 ┃ ┗ 📜sign.html
 ┣ 📜.prettierrc
 ┣ 📜app.js
 ┗ 📜package.json

```

<h2>🏃프로젝트 개요</h2>
<P>
  그동안 Node.js를 이용한 백엔드 공부를 하면서 로그인 인증을 여러차례 구현해봤지만, 항상 passport를 비롯한 로그인 인증에 대한 이해가 부족하다는 것을 느껴서 
  로그인 인증만 구현하는 미니 프로젝트를 진행하게 되었습니다.
  따라서 로그인 인증에 필요한 각 단계와 이를 쉽게 구현할 수 있게 도와주는 package 중 하나인 passport를 하나씩 알아보도록 하겠습니다.
</p>

<h2> 🏁실행 </h2>

### 1️⃣passport-local
![local login](https://github.com/Lee-moo/Login_Authentication_Node.js/blob/main/readmeImage/passport-local.gif)

### 2️⃣passport-kakao 
![kakao login](https://github.com/Lee-moo/Login_Authentication_Node.js/blob/main/readmeImage/passport-kakao.gif)

## 💪세션을 이용한 로그인 인증 
<p>
세션을 이용한 로그인 인증은 아래의 각 단계를 거칩니다. <br>
  1. 사용자는 ID, PW를 이용해 로그인 요청을 합니다.<br>
  2. 서버는 사용자가 입력한 ID, PW가 올바르다면 세션에 사용자의 정보를 저장하고 쿠키에 session ID 값을 저장 후 요청에 대한 응답을 처리합니다.<br>
  3. 이후의 사용자는 요청 시 쿠키에 저장된 session ID 값을 같이 request header에 포함시켜 보냅니다.<br>
  4. 서버는 사용자 요청 시 보내온 session ID 값을 통해 사용자의 로그인을 유지시키며, 사용자에 맞는 데이터는 보내줍니다.<br>
</p>

### passport-local을 이용한 로그인 인증 
<p>
  위의 세션을 이용한 로그인 인증을 Node.js에서 구현할 경우 [passport](http://www.passportjs.org/) 패키지를 사용해 간단하게 구현할 수 있습니다.
  passport는 각 인증 방식에 따라 전략(Strategy)이라고 부르며 각 전략을 통해 원하는 로그인 인증 방식을 채택해 사용할 수 있어 유연한 방식이라 생각합니다.
  
  passport-local은 username과 password를 이용해 인증을 하는 전략으로 각 단계를 코드를 통해 자세하게 알아보겠습니다.
</p>

#### app.js
```
const session = require('express-session');
const passportConfig = require('./passport');
const passport = require('passport');

passportConfig();


app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIESECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
```

#### main.html
```
<form action="/" method="post" enctype="application/json">
  <div class="input">
    <input type="text" id="user_id" name="user_id" placeholder="ID" />
    <input type="password" id="password" name="password" placeholder="PW" />
    <input type="submit" value="LOG IN" />
  </div>
</form>
```

#### page.js(login router)
```
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
```

#### LocalStreategy.js
```
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
```

#### passport/index.js
```
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
```

- 위의 코드들은 각 파일에서 로그인에 관련된 로직들만 따로 뺏습니다.
- passport를 사용한 로그인 인증을 하기 전에 passport를 하기 위해서 기본적으로 설정해야 할 것들이 있습니다.
- app.js에서 passportConfig()는 passport/index.js 파일에 있는 app.js에 추가하기 위한건데, app.js를 복잡하지 않게 하기 위해서 따로 뺏습니다.
- passport/index.js에 있는 내용들은 마지막에 설명하겠습니다.
- passport.initialize()는 passport를 사용하기 전에 기본 작업을 수행합니다.
- passport는 기본적으로 session을 사용해 사용자 인증을 처리하기 때문에 꼭 express-session 뒤에 나와야 합니다. 

<p>
이제부터 passport를 이용한 사용자 인증의 각 단계를 코드를 기반으로 알아보겠습니다.<br>
1. 사용자가 ID, PW를 통해 로그인을 요청합니다.(main.html) <br>
  - 사용자는 id, pw를 입력해 post 방식으로 서버에 로그인을 요청합니다. <br>
2. 서버는 해당 경로의 router를 통해 사용자의 로그인 요청을 받습니다. (page.js) <br>
  - passport.authentication('local')부분이 바로 passport-local 전략을 통해 로그인 인증을 한다는 것이고,
  passport-local이 구현되어 있는 passport/localStrategy.js로 이동합니다.  <br>
3. passport-local의 코드의 usernameFiled와 passwordFiled는 사용자의 id와 pw를 설정하는 부분인데, 각 값은 사용자가 form 태그로 보내온 
  parameter의 name을 적어주시면 됩니다. main.html에서 id의 name은 'user_id', pw의 name은 'password'라고 해줬기 때문에 동일하게 적어줍니다. 이렇게 동일한 name을 적어주시면 passport가 알아서 req.body에 있는 데이터를 파라미터로 넣어줍니다.<br>
4. 이렇게 username과 password를 설정하면 두 번째 파라미터인 verify callback이 실행됩니다. 여기서 우리는 입력받은 username, password를 DB에 저장되어 있는 사용자 정보와 비교합니다. <br>
  코드를 보면 우선 ID를 검색해 사용자가 존재하는 지 검색하고 존재한다면 비밀번호를 비교합니다. 후에 verify callback의 파라미터인 done을 호출하는데 done을 호출하면 2번째 page.js의 router의 콜백 함수가 호출됩니다. <br>
  
  다시 page.js로 돌아가기 전에 done에 대해 자세하게 알아보겠습니다.<br>
  done(null, user) - 
  done(null, false, {message:'not found'})
  done(error)
 
</p>





