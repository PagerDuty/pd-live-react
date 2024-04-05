import 'mocks/pdoauth';

import urlLib from 'url';
import {
  faker,
} from '@faker-js/faker';

import {
  PD_OAUTH_CLIENT_ID, PD_OAUTH_CLIENT_SECRET,
} from 'src/config/constants';

import {
  createCodeVerifier,
  getAuthURL,
  exchangeCodeForToken,
  digestVerifier,
  base64Unicode,
} from './auth';

const unmockedFetch = global.fetch;

describe('Authentication Helper Suite', () => {
  const clientId = PD_OAUTH_CLIENT_ID;
  const clientSecret = PD_OAUTH_CLIENT_SECRET;
  const redirectURL = 'http://localhost:3000/';
  const code = 'SOME_REDIRECT_CODE';
  const mockAccessToken = faker.string.alphanumeric();
  let codeVerifier;
  let hash;
  let authURL;

  // Setup tests and mock API
  beforeAll(async () => {
    codeVerifier = createCodeVerifier();
    hash = await digestVerifier(codeVerifier);
    global.fetch = (url) => Promise.resolve({
      json: () => {
        let response;
        const {
          host, path,
        } = urlLib.parse(url);
        if (host === 'identity.pagerduty.com' && path.startsWith('/oauth/token')) {
          response = {
            client_info: 'prefix_legacy_app',
            id_token: hash,
            access_token: mockAccessToken,
            refresh_token: mockAccessToken,
          };
        } else {
          response = {};
        }
        return Promise.resolve(response);
      },
    });
  });

  // Reset fetch mock
  afterAll(() => {
    global.fetch = unmockedFetch;
  });

  it('Create valid code verifier', () => {
    expect(codeVerifier).toEqual(
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    );
  });

  it('Digest code verifier', async () => {
    expect(hash).toHaveLength(32);
  });

  it('Get valid auth URL', async () => {
    const codeChallenge = encodeURI(base64Unicode(hash));
    authURL = await getAuthURL(clientId, clientSecret, redirectURL, codeVerifier);
    expect(authURL).toEqual(
      // eslint-disable-next-line max-len
      `https://identity.pagerduty.com/oauth/authorize?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectURL}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`,
    );
  });

  it('Retrieve auth token from code', async () => {
    const token = await exchangeCodeForToken(
      clientId,
      clientSecret,
      redirectURL,
      codeVerifier,
      code,
    );
    expect(token.access_token).toEqual(mockAccessToken);
  });
});
