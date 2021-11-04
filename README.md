# PagerDuty Live

This repository hosts the source code for PagerDuty Live, a single page application which enables organisations to manage their PagerDuty incidents in real-time through a unified console view.


Further details on roadmap functionality, bugs, etc can be viewed on the [wiki](https://github.com/giranm/pd-live-react/wiki).  
For any issues, please raise a [GitHub issue](https://github.com/giranm/pd-live-react/issues/new) which can be tracked accordingly.

<kbd>
<img width="1623" alt="Screenshot 2021-11-04 at 14 46 53" src="https://user-images.githubusercontent.com/20474443/140336293-32b06e7b-c375-4783-aac1-062b08bfe39a.png">
</kbd>

## Local Development

1. Install [NodeJS v11.10.1](https://nodejs.org/tr/blog/release/v11.10.1/) (or switch using [`asdf install`](https://github.com/asdf-vm/asdf))

2. Install `craco` via `npm install @craco/craco --save --global`  
   (NB - you may need to reload terminal session to use the alias)

3. `git clone` repo to desired destination and `cd` into directory.

4. _(Optional unless you are not serving at http://localhost:3000)_

   - Go into PD developer mode, create a new app, add OAuth 2.0 and add a URL to the base of wherever you are serving the app
   - Update `PD_OAUTH_CLIENT_ID` within `src/util/constants.js`, which is required for `PDOAuth.login()`

5. Install dependencies with `npm install` and run application locally using `npm start`  
   (e.g. navigate to http://localhost:3000/ to use the app; be sure to remove pd-live-react suffix)
