import { test, expect } from "../lambdatest-setup";
import App from "./App";

test.use({ viewport: { width: 500, height: 500 } });

test.describe("Mount components", () => {
  test("should work", async ({ mount }) => {
    const component = await mount(<App />);
    await expect(component).toContainText("Vite + React");
  });
});
