# Playwright on LambdaTest Cloud

This monorepo includes 5 workspaces:

* test-js
* test-ts
* jest-js
* cucumber-js
* ct (this uses @playwright/experimental-ct-react)

Each workspace has a test command that runs on LambdaCloud. Some workspaces have a `test:local` command that will only run locally.

This project was cloned from [LambdaTest's Playwright Sample Repo](https://github.com/LambdaTest/playwright-sample/). Everything in the `archive` directory seemed unrelated to our project.

## Setup

```
npm install
npx playwright install
```

## Other Things of Note

The `ct` workspace is incomplete. I was unable to establish a connection to LambdaCloud and use the `mount` fixture.
In every instance, `mount` timed out
