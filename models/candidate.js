const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email_address: { type: String, required: true },
});

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
