const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const Booking = require("../models/Booking");
const Config = require("../models/Config");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 홈 페이지
router.get("/", (req, res) => {
    res.render("index");
});

router.get("/booking", (req, res) => {
    res.render("booking");
});

router.get("/preview", (req, res) => {
    res.render("preview");
});

// 특정 날짜 예약 가져오기
router.get("/get-list-of-bookings", async (req, res) => {
    try {
        const bookings = await Booking.find({ date: req.query.date });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 특정 날짜와 시간의 예약 가져오기
router.get("/list-of-bookings-date-time", async (req, res) => {
    try {
        const bookings = await Booking.find({ date: req.query.date, time: req.query.time });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 예약 가능 여부 확인
router.post("/booking/check-availability", async (req, res) => {
    const { date, time, people, email } = req.body;

    try {
        // 중복 예약 확인
        const existingBooking = await Booking.findOne({ date, time, email });
        if (existingBooking) {
            return res.json({ isAvailable: false, reason: "duplicate" });
        }

        // 좌석 초과 확인
        const config = await Config.findOne();
        const maxSeats = config.maxSeats;

        const bookingsForSlot = await Booking.find({ date, time });
        const totalPeople = bookingsForSlot.reduce((sum, booking) => sum + booking.people, 0);

        if (totalPeople + parseInt(people, 10) > maxSeats) {
            return res.json({ isAvailable: false, reason: "overcapacity" });
        }

        res.json({ isAvailable: true });
    } catch (error) {
        console.error("Error checking booking availability:", error);
        res.status(500).send("Error checking booking availability");
    }
});

router.post("/confirm", async (req, res) => {
    try {
        // 폼 데이터 처리
        const { date, time, people, firstName, lastName, phone, email, message } = req.body;

        // 중복 예약 확인
        const existingBooking = await Booking.findOne({ 
            date,
            time,
            firstName,
            lastName,
            });
        if (existingBooking) {
            return res.status(400).render("error", { message: "이미 동일한 시간에 예약이 존재합니다." });
        }

        // 좌석 초과 확인
        const config = await Config.findOne();
        const maxSeats = config.maxSeats;

        const bookingsForSlot = await Booking.find({ date, time });
        const totalPeople = bookingsForSlot.reduce((sum, booking) => sum + booking.people, 0);

        if (totalPeople + parseInt(people, 10) > maxSeats) {
            return res.status(400).render("error", { message: "해당 시간대의 최대 좌석 수를 초과했습니다." });
        }

        // 예약 데이터 저장
        const newBooking = new Booking({
            date,
            time,
            people,
            firstName,
            lastName,
            phone,
            email,
            message,
        });

        await newBooking.save();

        // 이메일 전송
        const emailSubject = "예약 확인 이메일";
        const emailContent = `
        <h1>예약 확인</h1><br>
        <p>${lastName} ${firstName}님, 예약이 성공적으로 완료되었습니다.</p>
        <p><strong>예약 상세 정보:</strong></p>
        <ul>
            <li><strong>날짜:</strong> ${date}</li>
            <li><strong>시간:</strong> ${time}</li>
            <li><strong>인원:</strong> ${people}명</li>
            <li><strong>전화번호:</strong> ${phone}</li>
            <li><strong>메시지:</strong> ${message || "없음"}</li>
        </ul><br>
        <p>감사합니다!</p>
        `;

        await transporter.sendMail({
            from: `"Restaurant Reservation" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: emailSubject,
            html: emailContent,
        });

        console.log("예약 확인 이메일이 전송되었습니다.");

        // 저장 후 확인 페이지 렌더링
        res.render("confirm", { date, time, people, firstName, lastName, phone, email, message });
    } catch (error) {
        console.error("Error saving booking:", error);
        res.status(500).send("예약 저장 중 오류가 발생했습니다.");
    }
});

module.exports = router;
