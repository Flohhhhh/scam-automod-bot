import { AppController } from "./app.controller";

describe("AppController", () => {
  it("returns a successful health response", () => {
    expect(new AppController().healthCheck()).toEqual({ status: "ok" });
  });
});
