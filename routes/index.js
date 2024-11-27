const express = require("express");
const nodemailer = require('nodemailer');
const router = express.Router();
const Booking = require("../models/Booking");
const Config = require("../models/Config");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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

router.post('/confirm', async (req, res) => {
    try {
        // 폼 데이터 처리
        const { date, time, people, firstName, lastName, phone, email, message } = req.body;

        // 예약 데이터 데이터베이스에 저장
        const newBooking = new Booking({
            date,
            time,
            people,
            firstName,
            lastName,
            phone,
            email,
            message
        });

        await newBooking.save(); // 데이터베이스에 저장

        //이메일 내용 생성
        const emailSubject = '예약 확인 이메일';
        const emailContent = `
        <h1>예약 확인</h1><br>
        <p>${lastName} ${firstName}님, 예약이 성공적으로 완료되었습니다.</p>
            <p><strong>예약 상세 정보:</strong></p>
            <ul>
                <li><strong>날짜:</strong> ${date}</li>
                <li><strong>시간:</strong> ${time}</li>
                <li><strong>인원:</strong> ${people}명</li>
                <li><strong>전화번호:</strong> ${phone}</li>
                <li><strong>메시지:</strong> ${message || '없음'}</li>
            </ul><br>
            <p>감사합니다!</p>
        `;

        // 이메일 전송
        await transporter.sendMail({
            from: `"Restaurant Reservation" <${process.env.EMAIL_USER}>`, // 발신자 이메일
            to: email, // 수신자 이메일
            subject: emailSubject,
            html: emailContent, // 이메일 본문 (HTML 형식)
        });

        console.log('예약 확인 이메일이 전송되었습니다.');

        // 저장 후 확인 페이지 렌더링
        res.render('confirm', {
            date,
            time,
            people,
            firstName,
            lastName,
            phone,
            email,
            message
        });
    } catch (error) {
        console.error("Error saving booking:", error);
        res.status(500).send("예약 저장 중 오류가 발생했습니다.");
    }
})

module.exports = router;
