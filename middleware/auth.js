const { User } = require("../models/User");

let auth = (req, res, next) => {
  //인증 처리를 하는 곳
  //클라이언트 쿠키에서 토큰을 가져온다. -> 쿠키 파서를 이용함
  let token = req.cookies.x_auth;

  //토큰을 복호화 한 뒤 유저를 찾는다
  User.findByToken(token, (err, user) => {
    if (err) throw err;

    //유저가 없으므로 auth 케이스 false 이고 에러가 있다고 전해줌
    if (!user) return res.json({ isAuth: false, error: true });

    req.token = token;
    req.user = user;
    next();
  });
  //유저 모델로가서 만든다

  //유저가 있으면 인증 성공
  //유저가 없으며 인증 실패
};

module.exports = { auth };
