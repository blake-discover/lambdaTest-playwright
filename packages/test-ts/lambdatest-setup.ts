import * as base from "@playwright/test";
import path from "path";
import { chromium } from "playwright";

type TestModule = base.TestType<
  base.PlaywrightTestArgs & base.PlaywrightTestOptions,
  base.PlaywrightWorkerArgs & base.PlaywrightWorkerOptions
>;

export type Capabilities = typeof rootCapabilities;

// LambdaTest capabilities
export const rootCapabilities = {
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
export const modifyCapabilities = ({ file, project, title }: base.TestInfo) => {
  const configName = project.name;
  const testName = `${title} - ${file.split(path.sep).pop()}`;

  const config = configName.split("@lambdatest")[0];
  const [browserName, browserVersion, platform] = config.split(":");

  rootCapabilities.browserName = browserName ?? rootCapabilities.browserName;
  rootCapabilities.browserVersion =
    browserVersion ?? rootCapabilities.browserVersion;
  rootCapabilities["LT:Options"]["platform"] =
    platform ?? rootCapabilities["LT:Options"]["platform"];
  rootCapabilities["LT:Options"]["name"] = testName;
};

export function generateTest(
  testModule: TestModule,
  capabilities: Capabilities
) {
  return testModule.extend({
    page: async ({ page }, use, testInfo) => {
      // Configure LambdaTest platform for cross-browser testing

      if (testInfo.project.name.match(/lambdatest/)) {
        modifyCapabilities(testInfo);

        const browser = await chromium.connect({
          wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
            JSON.stringify(capabilities)
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

const test = generateTest(base.test, rootCapabilities);

export default test;
