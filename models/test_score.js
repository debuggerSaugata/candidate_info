const mongoose = require("mongoose");

const testScoreSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
  },
  first_round: {
    type: Number,
    required: true,
  },
  second_round: {
    type: Number,
    required: true,
  },
  third_round: {
    type: Number,
    required: true,
  },
  totalNumber: {
    type: Number,
  },
});

const TestScore = mongoose.model("TestScore", testScoreSchema);

module.exports = TestScore;
