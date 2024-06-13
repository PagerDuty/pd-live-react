# PagerDuty Live

This repository hosts the source code for PagerDuty Live, an open-source, single page application which enables organisations to manage their PagerDuty incidents in real-time through a unified console view.

**Live URL: https://pagerduty.github.io/pd-live-react/**

## :warning: Disclaimer

**This project is not officially supported by PagerDuty and therefore no issues can be reported to or resolved by PagerDuty Support.
This is an open-source project designed to be used in a safe/test environment before users can leverage on their primary domains.**

- Full Disclaimer: https://www.termsfeed.com/live/68d1a0f2-9e68-47d0-9623-68afe0c31f6d
- For any issues, please raise a [GitHub issue](https://github.com/pagerduty/pd-live-react/issues/new) which can be tracked accordingly.

## Screenshot

<kbd>
<img width="1625" alt="Screenshot 2021-11-05 at 18 35 16" src="https://user-images.githubusercontent.com/20474443/184557375-6f2e18ac-bc0a-4ea7-a9b7-800d59f02ec6.png">
</kbd>

## Development

#### Register PagerDuty App

If you wish to maintain + deploy your own version of PagerDuty Live, we recommend registering a new OAuth app as follows:

- Within PagerDuty developer mode, [register a new app](https://developer.pagerduty.com/docs/ZG9jOjExMDI5NTY5-register-an-app)
- [Add OAuth 2.0 workflow](<(https://developer.pagerduty.com/docs/ZG9jOjExMDI5NTcz-o-auth-2-0-functionality#add-oauth-20-functionality-to-your-app)>) to the app and update the URL to the app host URL

#### Local Development

1. Install [NodeJS v20.14.0](https://nodejs.org/en/blog/release/v20.14.0/) via [`asdf install`](https://github.com/asdf-vm/asdf) / [`nvm`](https://github.com/nvm-sh/nvm)

2. `$ git clone` repo to desired destination and `$ cd pd-live-react` into directory

3. Create `.env` file in project root with overriding configuration (see section below for details)

4. Install dependencies with `$ yarn install` and run application locally using `$ yarn start`  
   The app will be available under http://localhost:3000/pd-live-react

## Environment Overrides

The following _optional_ parameters can be used in a `.env` file to override PagerDuty Live during `$ yarn start`:  
| Parameter | Usage |
| ----------- | ----------- |
| `VITE_PD_ENV` | PagerDuty Live Environment Tag; defaults to `localhost-dev` if not set |
| `VITE_PD_OAUTH_CLIENT_ID` | PagerDuty OAuth App client ID (created upon registering app) |
| `VITE_PD_OAUTH_CLIENT_SECRET` | PagerDuty OAuth App client secret (created upon registering app) |
| `VITE_PD_USER_TOKEN` | PagerDuty [Personal API Token](https://support.pagerduty.com/docs/generating-api-keys#generating-a-personal-rest-api-key); this will override OAuth login workflow if set and should be used for integration tests|
| `VITE_PD_SUBDOMAIN_ALLOW_LIST` | Comma separated list of allowed subdomains (e.g. `acme-prod,acme-dev`) |
| `VITE_PD_REQUIRED_ABILITY` | PagerDuty account-level [ability](https://developer.pagerduty.com/api-reference/b3A6Mjc0ODEwMg-list-abilities) required to use application |
| `VITE_DD_APPLICATION_ID` | Datadog [RUM Application ID](https://docs.datadoghq.com/real_user_monitoring/browser/#setup) |
| `VITE_DD_CLIENT_TOKEN` | Datadog [RUM Client Token](https://docs.datadoghq.com/account_management/api-app-keys/#client-tokens) |
| `VITE_DD_SITE` | Datadog [site](https://docs.datadoghq.com/agent/basic_agent_usage/?tab=agentv6v7#datadog-site) (e.g. `datadoghq.com`) |
| `VITE_DD_SAMPLE_RATE` | Datadog [RUM Sample Rate](https://docs.datadoghq.com/real_user_monitoring/browser/#browser-and-session-replay-sampling-configuration) (e.g. `100`) |
| `VITE_DD_TRACK_INTERACTIONS` | Datadog [RUM Track Interactions](https://docs.datadoghq.com/real_user_monitoring/browser/tracking_user_actions/?tab=npm) (e.g. `true`) |
| `VITE_DD_DEFAULT_PRIVACY_LEVEL` | Datadog [RUM Default Privacy Level](https://docs.datadoghq.com/real_user_monitoring/session_replay/privacy_options/?tab=maskuserinput) (e.g. `mask-user-input`) |

## Testing

The following scripts have been created to run unit, component, and integration tests:

- `$ yarn jest` (Jest Unit/Component)
- `$ yarn cypress:run:local` (Cypress Integration with headless Chromedriver)

Please note that running integration tests will require environment variable `VITE_PD_USER_TOKEN` set.

The integration tests also assume the PagerDuty account associated with the above user token has been setup with the following [Terraform environment](https://github.com/pagerduty/pd-live-integration-test-environment).

## Versioning & Release

To prepare PagerDuty Live for release, the current workflow should be carried out:

1.  Checkout to `develop` branch and verify if it's stable - i.e. no test and linting failures.

2.  Update version information in `package.json` using `npm version` - example commands given below:

    - Bumping patch version for beta release
      ```
      $ npm --no-git-tag-version version preminor --preid beta
      v0.1.0-beta.0
      ```
    - Bumping minor version for main release
      ```
      $ npm --no-git-tag-version version minor
      v0.2.0
      ```

3.  Update application code version using `$ yarn genversion`

4.  Prepare the appropriate release branch via `$ git checkout -b release/<VERSION>` (following above [semver](https://semver.org/))

5.  Stage modified files, commit, and push changes upstream:

    ```
    $ git add .
    $ git commit -m "Publishing release <VERSION>"
    $ git push --set-upstream origin release/<VERSION>
    ```

6.  Raise [pull requests](https://github.com/pagerduty/pd-live-react/pulls) to merge into `main` branch.

7.  Build static bundle via `$ yarn build` or use appropriate CI/CD workflow.

## License

MIT License

Copyright (c) 2021 Giran Moodley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
