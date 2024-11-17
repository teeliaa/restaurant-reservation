const mongoose = require('mongoose');

const { Schema } = mongoose;

const configSchema = new Schema({
    maxSeat: {
      type: Number,
      required: true, 
      min: 1, 
    },
    Slot1: {
      type: String,
      required: true, // 필수 필드
      match: /^([01]\d|2[0-3]):([0-5]\d)$/, // 시간 형식 (HH:mm)
    },
    Slot2: {
      type: String,
      required: true, // 필수 필드
      match: /^([01]\d|2[0-3]):([0-5]\d)$/, // 시간 형식 (HH:mm)
    },
    unavailableDates: {
      type: [Date], 
      default: [], 
    },
  },
  {
    timestamps: true, 
  }
);

// 모델 생성
const Config = mongoose.model('Config', configSchema);

module.exports = Config;