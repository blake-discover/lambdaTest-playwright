/**
 * Add the file in your test suite to run tests on LambdaTest.
 * Import `test` object from this file in the tests.
 */

import * as base from "@playwright/experimental-ct-react";

import { generateTest, capabilities } from "../test-ts/lambdatest-setup";

const config: typeof capabilities = {
  ...capabilities,
  "LT:Options": {
    ...capabilities["LT:Options"],
    build: "Playwright CT Build",
  },
};

const lambdaTest = generateTest(base.test, config);

export * from "@playwright/experimental-ct-react";
export { lambdaTest as test };
