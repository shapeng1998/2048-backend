const mongoose = require('mongoose');

const playersSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('Player', playersSchema);
