import request from "supertest";
import { Express } from "express";

// Assumes you export the Express app instance from src/app
import app from "../src/app";

describe("Disputes API", () => {
  let server: Express;
  beforeAll(async () => {
    server = app as unknown as Express;
  });

  describe("POST /api/disputes/open", () => {
    it("rejects missing fields with 400", async () => {
      const res = await request(server).post("/api/disputes/open").send({});
      expect(res.status).toBe(400);
      expect(res.body.error || res.body.message).toBeDefined();
    });

    it("accepts valid payload", async () => {
      const payload = {
        projectId: "0x0000000000000000000000000000000000000001",
        milestoneId: 1,
        reason: "Proof of dispute reason with more than 10 chars",
        openedBy: "0x0000000000000000000000000000000000000002",
      };
      const res = await request(server).post("/api/disputes/open").send(payload);
      expect(res.status).toBeLessThan(500); // 200/201 depending on implementation
      expect(res.body.dispute || res.body.id).toBeDefined();
    });
  });

  describe("POST /api/disputes/upload-evidence", () => {
    it("rejects missing disputeId with 400", async () => {
      const res = await request(server).post("/api/disputes/upload-evidence").field("uploadedBy", "0x0");
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/disputes/ai-summary", () => {
    it("requires disputeId", async () => {
      const res = await request(server).post("/api/disputes/ai-summary").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/disputes/:id", () => {
    it("returns 404 for unknown id", async () => {
      const res = await request(server).get("/api/disputes/unknown-id");
      expect([404, 400]).toContain(res.status);
    });
  });

  describe("GET /api/disputes", () => {
    it("supports filters and returns array", async () => {
      const res = await request(server).get("/api/disputes?status=Pending&limit=10");
      expect(res.status).toBeLessThan(500);
      expect(Array.isArray(res.body.disputes || res.body)).toBeTruthy();
    });
  });
});

describe("Admin Disputes API", () => {
  let server: Express;
  beforeAll(async () => {
    server = app as unknown as Express;
  });

  describe("POST /api/admin/disputes/:id/resolve", () => {
    it("requires resolverDecision field", async () => {
      const res = await request(server).post("/api/admin/disputes/some-id/resolve").send({});
      expect(res.status).toBe(400);
    });

    it("rejects invalid resolverDecision", async () => {
      const res = await request(server)
        .post("/api/admin/disputes/some-id/resolve")
        .send({ resolverDecision: "invalid" });
      expect(res.status).toBe(400);
    });
  });
});
