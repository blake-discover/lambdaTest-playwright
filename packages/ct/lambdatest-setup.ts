/**
 * Add the file in your test suite to run tests on LambdaTest.
 * Import `test` object from this file in the tests.
 */

import * as base from "@playwright/experimental-ct-react";
import { chromium } from "playwright";
import path from "path";

import { capabilities, modifyCapabilities } from "../test-ts/lambdatest-setup";

const config: typeof capabilities = {
  ...capabilities,
  "LT:Options": {
    ...capabilities["LT:Options"],
    build: "Playwright CT Build",
  },
};

const lambdaTest = base.test.extend({
  page: async ({ page }, use, testInfo) => {
    if (testInfo.project.name.match(/lambdatest/)) {
      modifyCapabilities(
        testInfo.project.name,
        `${testInfo.title} - ${testInfo.file.split(path.sep).pop()}`
      );

      console.log("initiated browser");
      const browser = await chromium.connect(
        `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
          JSON.stringify(config)
        )}`
      );
      console.log("initiated page");
      const ltPage = await browser.newPage(testInfo.project.use);

      console.log("using page");
      await use(ltPage);

      const testStatus = {
        action: "setTestStatus",
        arguments: {
          status: testInfo.status,
          remark: testInfo.error?.stack || testInfo.error?.message,
        },
      };
      console.log("eval");
      await ltPage.evaluate(() => {},
      `lambdatest_action: ${JSON.stringify(testStatus)}`);

      console.log("closing");
      await ltPage.close();
      await browser.close();
    } else {
      use(page);
    }
  },
});

export * from "@playwright/experimental-ct-react";
export { lambdaTest as test };
