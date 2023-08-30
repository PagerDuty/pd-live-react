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

  let codeVerifier = sessionStorage.getItem('code_verifier');
  let {
    redirectURL,
  } = props;
  const {
    clientId, clientSecret,
  } = props;

  if (!redirectURL) {
    // assume that the redirect URL is the current page
    redirectURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  }

  useEffect(() => {
    if (code && codeVerifier && !accessToken) {
      exchangeCodeForToken(clientId, clientSecret, redirectURL, codeVerifier, code).then(
        (token) => {
          sessionStorage.removeItem('code_verifier');
          sessionStorage.setItem('pd_access_token', token);
          window.location.assign(redirectURL);
        },
      );
    } else if (!accessToken) {
      codeVerifier = createCodeVerifier();
      sessionStorage.setItem('code_verifier', codeVerifier);
      getAuthURL(clientId, clientSecret, redirectURL, codeVerifier).then((url) => {
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
