/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */

import React from 'react';

if (import.meta.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  // const ReactRedux = require('react-redux');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
  });
}
