const { test } = require("../lambdatest-setup");
const { expect } = require("@playwright/test");

test.describe("Browse LambdaTest in different search engines", () => {
  test("Search LambdaTest Blog on DuckDuckGo", async ({ page }) => {
    await page.goto("https://duckduckgo.com");
    let element = await page.locator('[name="q"]');
    await element.click();
    await element.type("LambdaTest Blog");
    await element.press("Enter");
    const title = await page.title();

    // Use the expect API for assertions provided by playwright
    expect(title).toEqual(expect.stringContaining("LambdaTest"));
  });
});
