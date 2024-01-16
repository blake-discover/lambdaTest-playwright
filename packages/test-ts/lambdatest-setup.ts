/**
 * Add the file in your test suite to run tests on LambdaTest.
 * Import `test` object from this file in the tests.
 */

import * as base from "@playwright/test";
import path from "path";
import { chromium } from "playwright";

type TestModule = base.TestType<
  base.PlaywrightTestArgs & base.PlaywrightTestOptions,
  base.PlaywrightWorkerArgs & base.PlaywrightWorkerOptions
>;

// LambdaTest capabilities
export const capabilities = {
  browserName: "Chrome", // Browsers allowed: `Chrome`, `MicrosoftEdge`, `pw-chromium`, `pw-firefox` and `pw-webkit`
  browserVersion: "latest",
  "LT:Options": {
    platform: "Windows 10",
    build: "Playwright TS Build",
    name: "Playwright Test",
    user: process.env.LT_USERNAME,
    accessKey: process.env.LT_ACCESS_KEY,
    network: true,
    video: true,
    console: true,
    tunnel: false, // Add tunnel configuration if testing locally hosted webpage
    tunnelName: "", // Optional
    geoLocation: "", // country code can be fetched from https://www.lambdatest.com/capabilities-generator/
  },
};

// Patching the capabilities dynamically according to the project name.
export const modifyCapabilities = (configName: string, testName: string) => {
  const config = configName.split("@lambdatest")[0];
  const [browserName, browserVersion, platform] = config.split(":");
  capabilities.browserName = browserName ?? capabilities.browserName;
  capabilities.browserVersion = browserVersion ?? capabilities.browserVersion;
  capabilities["LT:Options"]["platform"] =
    platform ?? capabilities["LT:Options"]["platform"];
  capabilities["LT:Options"]["name"] = testName;
};

export function generateTest(
  testModule: TestModule,
  config: typeof capabilities
) {
  return testModule.extend({
    page: async ({ page }, use, testInfo) => {
      // Configure LambdaTest platform for cross-browser testing
      let fileName = testInfo.file.split(path.sep).pop();
      if (testInfo.project.name.match(/lambdatest/)) {
        modifyCapabilities(
          testInfo.project.name,
          `${testInfo.title} - ${fileName}`
        );

        const browser = await chromium.connect({
          wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
            JSON.stringify(config)
          )}`,
        });

        const ltPage = await browser.newPage(testInfo.project.use);
        await use(ltPage);

        const testStatus = {
          action: "setTestStatus",
          arguments: {
            status: testInfo.status,
            remark: testInfo.error?.stack || testInfo.error?.message,
          },
        };
        await ltPage.evaluate(() => {},
        `lambdatest_action: ${JSON.stringify(testStatus)}`);
        await ltPage.close();
        await browser.close();
      } else {
        // Run tests in local in case of local config provided
        await use(page);
      }
    },
  });
}

const test = generateTest(base.test, capabilities);

export default test;
