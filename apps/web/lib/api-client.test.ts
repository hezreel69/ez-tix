import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.js";
import { getAccessToken, setAccessToken } from "./api-client.js";

describe("@eztix/web configuration and api-client", () => {
  it("configures Next.js rewrites to proxy /api/:path* to the Express backend", async () => {
    expect(nextConfig.rewrites).toBeDefined();
    const rewrites = await nextConfig.rewrites?.();
    expect(rewrites).toEqual([
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ]);
  });

  it("stores and retrieves in-memory access token", () => {
    expect(getAccessToken()).toBeNull();
    setAccessToken("test-jwt-token");
    expect(getAccessToken()).toBe("test-jwt-token");
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});
