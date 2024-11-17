const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
      date: {
        type: String,
        required: true, // 필수 필드
      },
      people: {
        type: Number,
        required: true,
        min: 1, // 최소 인원 1명
      },
      time: {
        type: String,
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
        match: /^[0-9\-+()\s]*$/, // 전화번호 형식 유효성 검사
      },
      email: {
        type: String,
        required: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // 이메일 형식 유효성 검사
      },
      message: {
        type: String,
        default: '', // 메시지는 선택적 필드
      },
    },
    {
      timestamps: true, 
    }
  );
  
  // 모델 생성
  const Booking = mongoose.model('Booking', bookingSchema);
  
  module.exports = Booking;