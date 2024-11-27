const mongoose = require('mongoose');

const { Schema } = mongoose;

const configSchema = new Schema({
    unavailableDates: {
      type: [Date], 
      default: [],
      validate: {
        validator: function(dates){
          const uniqueDates = [...new Set(dates.map(d=>d.toISOString()))];
          return uniqueDates.length === dates.length;
        },
        message: '중복된 예약 불가 날짜가 존재합니다.',
      },
    },
    timeSlots: {
      type: [String],
      default: []
    },
    maxSeats: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true, 
  });

// 모델 생성
const Config = mongoose.model('Config', configSchema);

module.exports = Config;