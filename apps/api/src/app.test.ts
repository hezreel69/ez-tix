import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("@eztix/api health and error envelope", () => {
  const app = createApp();

  it("GET /health returns 200 ok without database/redis dependency", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.epoch).toBe("string");
    expect(res.headers["x-request-id"]).toMatch(/^req_/);
  });

  it("GET /api/v1/health returns 200 ok", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /ready returns 200 ready", async () => {
    const res = await request(app).get("/ready");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ready");
  });

  it("returns standard TRD Section 12 error format on unknown routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route GET /api/v1/does-not-exist not found.",
        requestId: expect.stringMatching(/^req_/),
      },
    });
  });
});
