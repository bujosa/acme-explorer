import http from "k6/http";
import { check, sleep } from "k6";
import { stages } from "./stages.js";

const selectedStages = stages[__ENV.STAGE_ID] || {
  stages: undefined,
  name: "|default|",
};

export const options = {
  stages: selectedStages.config,
  thresholds: { http_req_duration: ["avg<500", "p(95)<1500"] },
  userAgent: "K6TestingUserAgent/1.0",
};

export default function () {
  const url = `${__ENV.HOSTNAME}/v1/trips`;

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    tags: {
      name: `${selectedStages.name} with trips`,
    },
  };

  const res = http.get(url, params);

  check(res, { "is status 200": (r) => r.status === 200 });

  sleep(1);
}
