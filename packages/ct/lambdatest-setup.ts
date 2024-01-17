import * as base from "@playwright/experimental-ct-react";
import { chromium } from "playwright";

import {
  rootCapabilities,
  modifyCapabilities,
} from "../test-ts/lambdatest-setup";
import type { Capabilities } from "../test-ts/lambdatest-setup";

const config: Capabilities = {
  ...rootCapabilities,
  "LT:Options": {
    ...rootCapabilities["LT:Options"],
    build: "Playwright CT Build",
  },
};

const lambdaTest = base.test.extend({
  page: async ({ page }, use, testInfo) => {
    if (testInfo.project.name.match(/lambdatest/)) {
      modifyCapabilities(testInfo);

      const browser = await chromium.connect(
        `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
          JSON.stringify(config)
        )}`
      );

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
      await use(page);
    }
  },
});

export * from "@playwright/experimental-ct-react";
export { lambdaTest as test };
