/* eslint-disable no-unused-vars */
/* ignore Invalid property 'align' found on tag 'div' */
/* eslint-disable react/no-unknown-property */

import React, {
  useState, useEffect,
} from 'react';

import {
  Form, Button, Dropdown, Spinner, Row,
} from 'react-bootstrap';

import {
  useTranslation,
} from 'react-i18next';

import {
  createCodeVerifier, getAuthURL, exchangeCodeForToken,
} from 'src/util/auth';

import './AuthComponent.scss';

const AuthComponent = (props) => {
  const {
    t,
  } = useTranslation();
  const [authURL, setAuthURL] = useState('');
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = sessionStorage.getItem('pd_access_token');
  const code = urlParams.get('code');
  const subdomain = urlParams.get('subdomain');
  const region = urlParams.get('service_region') || 'us';
  const buttons = urlParams.getAll('button');

  let codeVerifier = sessionStorage.getItem('code_verifier');
  let {
    redirectURL,
  } = props;
  const {
    clientId,
  } = props;

  if (!redirectURL) {
    // assume that the redirect URL is the current page
    redirectURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  }

  useEffect(() => {
    if (code && codeVerifier && !accessToken) {
      // if there were button params on the first load, load the button params and put them back on the URL
      const savedButtonsStr = sessionStorage.getItem('pd_buttons');
      const savedButtons = savedButtonsStr ? JSON.parse(savedButtonsStr) : [];
      const buttonParams = savedButtons ? `?button=${savedButtons.join('&button=')}` : '';

      exchangeCodeForToken(clientId, redirectURL, codeVerifier, code).then((data) => {
        const {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          expires_in: expiresIn,
        } = data;
        if (!newAccessToken || !newRefreshToken || !expiresIn) {
          window.location.assign(redirectURL + buttonParams);
        }
        sessionStorage.removeItem('code_verifier');
        sessionStorage.setItem('pd_access_token', newAccessToken);
        sessionStorage.setItem('pd_refresh_token', newRefreshToken);
        sessionStorage.setItem('pd_token_expires_at', new Date().getTime() + expiresIn * 1000);
        window.location.assign(redirectURL + buttonParams);
      });
    } else if (!accessToken) {
      codeVerifier = createCodeVerifier();
      sessionStorage.setItem('code_verifier', codeVerifier);
      // if the user wants to use a button, save the button params in session storage
      // (because we can't pass them through the OAuth flow)
      if (buttons.length > 0) {
        sessionStorage.setItem('pd_buttons', JSON.stringify(buttons));
      } else {
        sessionStorage.removeItem('pd_buttons');
      }
      getAuthURL(clientId, redirectURL, codeVerifier).then((url) => {
        const subdomainParams = subdomain ? `&subdomain=${subdomain}&service_region=${region}` : '';
        setAuthURL(`${url}${subdomainParams}`);
      });
    }
  }, []);

  if (code && codeVerifier) {
    return (
      <div align="center">
        <br />
        <Row className="justify-content-md-center">
          <Spinner animation="border" role="status" variant="success" />
          <h5 className="querying-incidents">
            <b>{t('Signing into PagerDuty Live')}</b>
          </h5>
        </Row>
      </div>
    );
  }
  return (
    <div align="center">
      <Form id="pd-login-form">
        <div id="pd-login-logo" />
        <Dropdown.Divider />
        <div id="pd-login-description">
          <h1>{t('Live Incidents Console')}</h1>
          <p>{t('Connect using PagerDuty OAuth to use this app')}</p>
        </div>
        <Button
          id="pd-login-button"
          variant="primary"
          size="lg"
          onClick={() => window.location.assign(authURL)}
        >
          {t('Sign In')}
        </Button>
      </Form>
    </div>
  );
};

export default AuthComponent;
