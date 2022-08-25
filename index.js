const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/key");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

//바디파서가 데이터를 분석해서 가져온다
app.use(bodyParser.urlencoded({ extended: true }));
//바디파서가 json타입으로 된 것을 분석해서 가져온다
app.use(bodyParser.json());
//인증 미들웨어 auth.js 코드 작성할 때 6번째 줄에서 토큰 이름인 x_auth를 인식하지 못하는 문제 발생해서 추가한 코드
app.use(cookieParser());

const mongoose = require("mongoose");

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useCreateIndex: true,
    //useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected.."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send(" 안녕하세요! 너무 졸려요 ");
});

//회원가입을 위한 라우터 만들기
app.post("/api/users/register", (req, res) => {
  //회원가입할 때 필요한 정보를 클라이언트에서 가져오면 데이터 베이스에 넣어준다.

  //인스턴스 만들기, 바디파서를 이용해서 리퀘스트 바디로 클라이언트 정보를 받아준다.
  const user = new User(req.body);

  //save()는 몽고디비 메소드. 유저 모델에 저장된 것
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });

    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  //요청된 이메일 주소가 없는 경우. 주소를 데이터베이스에서 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다",
      });
    }

    //요청된 이메일이 데이터 베이스에 있는 경우, 비밀번호가 맞는 비밀번호인지 확인한다.

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
    });
    //비밀번호까지 맞다면 토큰을 생성하기.
    user.generateToken((err, user) => {
      if (err) return res.status(400).send(err);

      //토큰을 저장한다. 어디에? 쿠키, 로컬 스토리지
      res
        .cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id });
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  // 비밀번호까지 맞다면, 토큰을 생성한다.
  //여기까지 미들웨어를 통과했다는 것은 어센틱케이션이 true 이다.
  //role 이 0이면 일반 유저이다.  role이 0이 아닌 경우는 관리자
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

//로그아웃 라우트 만들기-> 로그아웃 하려는 유저를 DB에서 찾는다 -> 유저의 토큰을 지운다.
//로그인 된 상태기 때문에 auth 미들 웨어 넣어준다.
app.get("/api/users/logout", auth, (res, req) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
