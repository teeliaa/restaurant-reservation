const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");
const Config = require("../models/Config");

// 헬퍼 함수: Config 문서 가져오기
async function getConfigDocument() {
    let config = await Config.findOne();
    if (!config) {
        config = new Config({ unavailableDates: [], timeSlots: [], maxSeats: 0 });
        await config.save();
    }
    return config;
}

// 예약 관리 라우터
router.get('/settings', async (req, res) => {
  try {
      const config = await Config.findOne();
      const formattedUnavailableDates = config.unavailableDates.map(date =>
        new Date(date).toISOString().split("T")[0]
      );
      res.render('admin/settings', { 
        unavailableDates: formattedUnavailableDates,
        timeSlots: config.timeSlots,
        maxSeats: config.maxSeats 
      });
  } catch (error) {
      console.error("Error loading settings page:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.post('/settings/update', async (req, res) => {
  try{
    const { timeSlot1, timeSlot2, maxSeats } = req.body;
    const config = await getConfigDocument();

    config.timeSlots = [timeSlot1, timeSlot2];
    config.maxSeats = parseInt(maxSeats, 10);
    await config.save();

    res.redirect('/admin/settings');
  } catch (error) {
    console.error("Error updating settings: ", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/settings/config', async (req, res) => {
  try {
      const config = await getConfigDocument();
      res.json({
          unavailableDates: config.unavailableDates.map(date => new Date(date).toISOString().split("T")[0]),
          timeSlots: config.timeSlots,
          maxSeats: config.maxSeats
      });
  } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

// 특정 날짜와 시간으로 예약 검색
router.get('/filtering', async (req, res) => {
    try {
        const { date, time } = req.query;

        // 조건부 검색: 날짜와 시간 둘 다 있으면 둘 다 필터링, 없으면 각각 필터링
        const query = {};
        if (date) query.date = date;
        if (time) query.time = time;

        const filteredBookings = await Booking.find(query);

        res.render('admin/filtering', { 
            filteredBookings, 
            date: date || "전체", 
            time: time || "전체" 
        });
    } catch (error) {
        console.error("Error filtering bookings:", error);
        res.status(500).send("Internal Server Error");
    }
});


// 예약 불가 날짜 가져오기
router.get('/settings/unavailable-dates', async (req, res) => {
    try {
        const config = await getConfigDocument();
        res.status(200).send(config.unavailableDates);
    } catch (error) {
        console.error("Error fetching unavailable dates:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 예약 불가 날짜 추가
router.post('/settings/unavailable-dates/add', async (req, res) => {
    try {
        const { date } = req.body;
        const config = await getConfigDocument();
        const parsedDate = new Date(date).toISOString().split("T")[0];

        if (!config.unavailableDates.includes(parsedDate)) {
          config.unavailableDates.push(parsedDate);
          await config.save();
      }

      res.redirect('/admin/settings');
    } catch (error) {
        console.error("Error adding unavailable date:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 예약 불가 날짜 삭제
router.post('/settings/unavailable-dates/remove', async (req, res) => {
    try {
        const { date } = req.body;
        const config = await getConfigDocument();
        const targetDate = new Date(date).toISOString().split("T")[0];

        // 삭제할 날짜 필터링
        config.unavailableDates = config.unavailableDates.filter(d => {
            const formattedDate = new Date(d).toISOString().split("T")[0];
            return formattedDate !== targetDate;
        });
        await config.save();

        const formattedDates = config.unavailableDates.map(d => new Date(d).toISOString().split("T")[0]);
        res.json({ unavailableDates: formattedDates }); // YYYY-MM-DD 형식으로 반환
    } catch (error) {
        console.error("Error removing unavailable date:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// 시간 슬롯 초기화
router.post('/settings/time-slots/reset', async (req, res) => {
  try {
      const config = await getConfigDocument();
      config.timeSlots = [];
      await config.save();
      res.redirect('/admin/settings');
  } catch (error) {
      console.error("Error resetting time slots:", error);
      res.status(500).send("Internal Server Error");
  }
});

// 최대 좌석 수 초기화
router.post('/settings/max-seats/reset', async (req, res) => {
  try {
      const config = await getConfigDocument();
      config.maxSeats = 0;
      await config.save();
      res.redirect('/admin/settings');
  } catch (error) {
      console.error("Error resetting max seats:", error);
      res.status(500).send("Internal Server Error");
  }
});

// 특정 예약 데이터 수정 페이지 렌더링
router.get('/:id/edit', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).send("예약을 찾을 수 없습니다.");
        }

        //res.render('admin/edit', { booking });
        const config = await getConfigDocument();
        res.render('admin/edit', { booking, timeSlots: config.timeSlots });

    } catch (error) {
        console.error("Error fetching booking for edit:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 특정 예약 데이터 수정 처리
router.post('/:id/edit', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { date, time, people, firstName, lastName, phone, email, message } = req.body;

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { date, time, people, firstName, lastName, phone, email, message },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).send("예약을 찾을 수 없습니다.");
        }

        res.redirect('/auth/private'); // 수정 후 예약 관리 페이지로 리다이렉트
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 특정 예약 삭제
router.post('/:id/delete', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const deletedBooking = await Booking.findByIdAndDelete(bookingId);

        if (!deletedBooking) {
            return res.status(404).send("예약을 찾을 수 없습니다.");
        }

        res.redirect('/auth/private'); // 삭제 후 예약 관리 페이지로 리다이렉트
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 공개 API: 예약 불가 날짜와 시간 슬롯 제공
router.get('/public-settings', async (req, res) => {
    try {
        const config = await Config.findOne() || { unavailableDates: [], timeSlots: []};
        res.json({
            unavailableDates: config.unavailableDates || [],
            timeSlots: config.timeSlots || [],
        });

    } catch (error) {
        console.error("Error fetching public settings:", error);
        res.status(500).json({ message: "서버 오류" });
    }
});


module.exports = router;

