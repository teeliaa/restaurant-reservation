const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../models/User");
const Booking = require("../models/Booking");
const Config = require("../models/Config");
const ITEMS_PER_PAGE = 10;

// 헬퍼 함수: Config 문서 가져오기
async function getConfigDocument() {
    let config = await Config.findOne();
    if (!config) {
        config = new Config({ unavailableDates: [], timeSlots: [], maxSeats: 0 });
        await config.save();
    }
    return config;
}

// 회원가입 페이지
router.get("/signup", (req, res) => {
    res.render("signup");
});

// 회원가입 처리
router.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render("signup", { errorMessage: "아이디와 비밀번호를 입력하세요." });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render("signup", { errorMessage: "이미 존재하는 아이디입니다." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });

        req.flash("success", "회원가입이 완료되었습니다.");
        res.redirect("/auth/login");
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 로그인 페이지
router.get("/login", (req, res) => {
    res.render("auth/login");
});

// 로그인 처리
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render("auth/login", { errorMessage: "존재하지 않는 아이디입니다." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.render("auth/login", { errorMessage: "비밀번호가 일치하지 않습니다." });
        }

        req.session.currentUser = user;
        res.redirect("/auth/private");
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 관리자 페이지 (예약 목록 및 시간 슬롯 포함)
router.get("/private", async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
  
    if (!req.session.currentUser) {
      req.flash("error", "로그인이 필요합니다.");
      return res.redirect("/auth/login");
    }
  
    try {
      // 총 예약 수 및 전체 페이지 계산
      const totalBookings = await Booking.countDocuments();
      const totalPages = Math.ceil(totalBookings / ITEMS_PER_PAGE);
  
      // 현재 페이지의 예약 가져오기
      const bookings = await Booking.find()
        .sort({ date: 1, time: 1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
  
      // 예약 데이터 포맷팅
      const formattedBookings = bookings.map(booking => ({
        ...booking._doc,
        date: new Date(booking.date).toISOString().split("T")[0],
      }));
  
      // 시간 슬롯 가져오기
      const config = await getConfigDocument();
      const timeSlots = config.timeSlots;
  
      // 데이터 전달
      res.render("auth/private", {
        user: req.session.currentUser,
        bookings: formattedBookings,
        timeSlots, // 시간 슬롯 전달
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      req.flash("error", "예약 데이터를 불러오는 중 문제가 발생했습니다.");
      res.redirect("/auth/login");
    }
  });

// 로그아웃 처리
router.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(500).send("Internal Server Error");
        }
        res.redirect("/auth/login");
    });
});

module.exports = router;
