require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const flash = require('connect-flash');
const helmet = require('helmet');
const cors = require('cors');

// 환경 변수 검증
if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.");
}

const app = express();

// DB 연결
mongoose
  .connect(process.env.MONGODB_URI)
  .then(x => console.log(`DB Connected! Database name: "${x.connections[0].name}"`))
  .catch(err => console.error('Error connecting to DB', err));


// 로그 미들웨어
app.use(morgan('dev'));

// 파서 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// 세션 설정
app.use(
    session({
        secret: process.env.SESSIONSECRET || 'defaultSecret',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 86400000 }, // 1일
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            ttl: 24 * 60 * 60,
        }),
    })
);

// 플래시 메시지
app.use(flash());
app.use((req, res, next) => {
    res.locals.flash = req.flash();
    next();
});

// Sass 미들웨어
app.use(
    require('sass-middleware')({
        src: path.join(__dirname, 'public'),
        dest: path.join(__dirname, 'public'),
        sourceMap: true,
    })
);

// 뷰 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'image', 'favicon.ico')));

// Handlebars 헬퍼 등록
hbs.registerHelper('incremented', function (index) {
    return index + 1;
});

hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('range', function (start, end, options) {
    let result = '';
    for (let i = start; i <= end; i++) {
        result += options.fn(i);
    }
    return result;
});

//두 값을 비교하는 헬퍼
hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

//날짜 형식 변환 헬퍼
hbs.registerHelper('formatDate', function (date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
});


// 앱 기본 제목
app.locals.title = 'Restaurant Reservation';

// 라우터 설정
const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth');
app.use('/auth', auth);

const admin = require('./routes/admin');
app.use('/admin', (req, res, next) => {
    if(req.session.currentUser){
        next();
    } else{
        if(!req.flash){
            req.flash('error', '관리자 로그인이 필요합니다');
        }
        res.redirect('/auth/login');
    }
});
app.use('/admin', admin);

// 서버 시작
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

