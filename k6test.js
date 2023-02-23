import http from "k6/http";
import { sleep } from "k6";

export const options = {
  scenarios: {
    stress: {
      executor: "ramping-arrival-rate",
      preAllocatedVUs: 1000,
      timeUnit: "1s",
      stages: [
        { duration: "1m", target: 50 }, // below normal load
        { duration: "1m", target: 100 },
        { duration: "1m", target: 110 }, // normal load
        { duration: "1m", target: 120 }, // around the breaking point
        { duration: "1m", target: 130 },
        { duration: "1m", target: 140 }, // beyond the breaking point
        { duration: "1m", target: 0 }, // scale down. Recovery stage.
      ],
    },
  },
};

export default function () {
  const BASE_URL = "http://localhost:3000"; // make sure this is not production
  const responses = http.batch([
    ["GET", `${BASE_URL}/qa/questions/:question_id=4/answers`],
    ["GET", `${BASE_URL}/qa/questions/:question_id=5/answers`],
    ["GET", `${BASE_URL}/qa/questions?id=13&page=1&count=1`],
    ["GET", `${BASE_URL}/qa/questions?id=4&page=1&count=1`],
  ]);
}