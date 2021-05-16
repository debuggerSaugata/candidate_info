const express = require("express");
const Candidate = require("../../models/candidate");
const TestScore = require("../../models/test_score");
const router = express.Router();

router.post("/registration", (req, res) => {
  Candidate.findOne({ email_address: req.body.email_address })
    .then((candidate) => {
      if (candidate)
        return res.status(400).json({
          error:
            "Candidate already exists. Please enter the candidate's score by using proper candidate id",
        });
      else {
        const newCandidate = new Candidate({
          name: req.body.name,
          email_address: req.body.email_address,
        });
        newCandidate
          .save()
          .then((candidate) =>
            res.status(201).json({
              message: "Candidate info received successfully",
              candidate,
            })
          )
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
});

router.post("/addscore/:cid", (req, res) => {
  Candidate.findById(req.params.cid)
    .then((user) => {
      if (!user)
        return res.status(404).json({
          message:
            "Candidate not exists, please re-check the id before adding score",
        });
      TestScore.findOne({ candidate: req.params.cid })
        .then((scorecard) => {
          if (scorecard)
            return res.status(400).json({
              message:
                "This candidate's record is already noted, please provide different candidate id",
            });
          else {
            const { first_round, second_round, third_round } = req.body;
            let errors = {};
            if (first_round > 10)
              errors.first_round =
                "Score of first round should in between 0 and 10";
            if (second_round > 10)
              errors.second_round =
                "Score of second round should in between 0 and 10";
            if (third_round > 10)
              errors.third_round =
                "Score of third round should in between 0 and 10";
            if (Object.keys(errors).length > 0)
              return res.status(400).json(errors);
            const newRecord = new TestScore({
              candidate: req.params.cid,
              first_round,
              second_round,
              third_round,
            });
            newRecord.totalNumber =
              newRecord.first_round +
              newRecord.second_round +
              newRecord.third_round;
            newRecord
              .save()
              .then((card) => {
                res.status(201).json({
                  message: "New record has been created successfully",
                  card,
                });
              })
              .catch((err) => {
                return res
                  .status(500)
                  .json({ message: "Internal server error", error: err });
              });
          }
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ message: "Internal server error", error: err });
        });
    })
    .catch((err) => {
      res.status(500).json({ message: "Internal server error", error: err });
    });
});

router.get("/result", async (req, res) => {
  try {
    const result = await TestScore.find().sort({ totalNumber: -1 }).limit(1);
    const candidateId = result[0].candidate;
    const candidate = await Candidate.findById(candidateId);

    const average = await TestScore.aggregate([
      {
        $group: {
          _id: null,
          first: { $avg: "$first_round" },
          second: { $avg: "$second_round" },
          third: { $avg: "$third_round" },
        },
      },
    ]);
    const all_round_averages = average[0];

    res.status(200).json({
      highest_scorer: candidate.name,
      all_candidate_round_wise_avg: {
        first_round_avg: all_round_averages.first,
        second_round_avg: all_round_averages.second,
        third_round_avg: all_round_averages.third,
      },
    });
  } catch (err) {
    return res.status(404).json({ message: "Result not found" });
  }
});

module.exports = router;
