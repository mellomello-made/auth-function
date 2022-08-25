const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  Image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  //비밀 번호를 바꿀 때만 암호화한다.
  let user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

//메소드 만들기
userSchema.methods.comparePassword = function (plainPassword, cd) {
  //plainPassword 123456 를 암호화해서 암호화된 비밀번호 @#$#% 가 맞는지 체크한다.
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cd(err), cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;
  // jsonwebtoke을 이용해서 토큰 생성하기
  let token = jwt.sign(user._id.toHexString(), "1234");
  // 두개를 합쳐서 토큰을 만들고
  //user._id + 'secretToken' = token
  //->
  // secretToken을 넣었을 때 user._id가 나온다

  user.token = this.token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  let user = this;

  //토큰을 디코드 한다.
  jwt.verify(token, "secretToken", function (err, decoded) {
    //유저 아이디를 이용해서 유저를 찾은 다음에
    //클라이언트에서 가저온 토큰과 데이터베이스에 보관된 토큰이 일치하는 지 확인한다.

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };

// bcrypt모듈 에러시
//npm install node-gyp -g
//npm install bcrypt -g
//npm install bcrypt --save
