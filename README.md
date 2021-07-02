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

<p>
passport를 이용한 로그인 인증을 하기 전에 기본적으로 해야 할 configuration이 있습니다.
보통 Node.js로 프로젝트를 구성할 때 app.js에 다양한 설정을 하기 때문에 저도 app.js에 passport에 기본 설정을 했습니다.
<pre><code>
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
</code></pre>

passportConfig()는 ./passport 폴더의 index.js 파일을 가리키는데 해당 파일에는 마지막에 알아보겠습니다.

passport.initialize()는 passport를 사용하기 위한 작업을 수행합니다.<br>
passport.session()은 passport는 기본적으로 session을 사용해 동작하기 때문에 꼭 express-session 뒤에 작성해줘야 합니다. 자세한 동작 과정을 코드를 통해서 알아보겠습니다. 
</p>


<p>
1. 사용자의 로그인 요청 
```
<form action="/" method="post" enctype="application/json">
    <div class="input">
       <input type="text" id="user_id" name="user_id" placeholder="ID" />
       <input type="password" id="password" name="password" placeholder="PW" />
       <input type="submit" value="LOG IN" />
    </div>
</form>
```
사용자가 post 방식으로 ID, PW를 입력 후 서버에 로그인을 요청합니다. 
</p>

```
2. 서버의 로그인 처리를 위한 라우터 
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

서버는 사용자의 로그인 요청을 처리하기 위해서 passport를 사용하는데
여기서 isNotLoggedIn은 사용자가 로그인이 상태가 아닌 경우에만 로그인 요청을 할 수 있도록 처리하기 위한 미들웨어입니다.
passport를 통해 사용자 로그인 인증이 정상적으로 수행되면 passport는 req.isAuthenticated()를 통해 해당 사용자의 로그인 여부를 Boolean 값으로
리턴해주는데 이를 편하게 사용하기 위해서 미들웨어로 구성한 것입니다. 

passport.authentication('local')은 passport-local을 사용한다고 것이고, 
이 명령을 만나면 passsport-local이 구현되어 있는 곳으로 이동합니다. 

--------------------------------------------------------------------


const LocalStrategy = require('passport-local').Strategy;

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










