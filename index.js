const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const { User } = require("./models/User");
const config = require("./config/key");

//바디파서가 데이터를 분석해서 가져온다
app.use(bodyParser.urlencoded({ extended: true }));
//바디파서가 json타입으로 된 것을 분석해서 가져온다
app.use(bodyParser.json());

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
app.post("/register", (req, res) => {
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
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
