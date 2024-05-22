export const gen64x8bitNonce = () => {
  const array = new Uint8Array(64);
  window.crypto.getRandomValues(array);
  return array;
};

export const digestVerifier = async (vString) => {
  const encoder = new TextEncoder();
  const verifier = encoder.encode(vString);
  const hash = await crypto.subtle.digest('SHA-256', verifier);
  return hash;
};

export const base64Unicode = (buffer) => {
  // |*|  Base64 / binary data / UTF-8 strings utilities (#1)
  // |*|  https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  // |*|  Author: madmurphy
  /* eslint-disable no-nested-ternary */
  /* eslint-disable arrow-body-style */
  const uint6ToB64 = (nUint6) => {
    return nUint6 < 26
      ? nUint6 + 65
      : nUint6 < 52
        ? nUint6 + 71
        : nUint6 < 62
          ? nUint6 - 4
          : nUint6 === 62
            ? 43
            : nUint6 === 63
              ? 47
              : 65;
  };

  const base64EncArr = (aBytes) => {
    const eqLen = (3 - (aBytes.length % 3)) % 3;
    let sB64Enc = '';

    for (let nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
      nMod3 = nIdx % 3;
      /* Uncomment the following line in order to split the output in lines 76-character long: */
      /*
      if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
      */
      /* eslint-disable no-bitwise */
      nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
      if (nMod3 === 2 || aBytes.length - nIdx === 1) {
        sB64Enc += String.fromCharCode(
          uint6ToB64((nUint24 >>> 18) & 63),
          uint6ToB64((nUint24 >>> 12) & 63),
          uint6ToB64((nUint24 >>> 6) & 63),
          uint6ToB64(nUint24 & 63),
        );
        nUint24 = 0;
      }
    }
    return eqLen === 0
      ? sB64Enc
      : sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? '=' : '==');
  };
  let encodedArr = base64EncArr(new Uint8Array(buffer));
  // manually finishing up the url encoding fo the encodedArr
  encodedArr = encodedArr.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return encodedArr;
};

export const createCodeVerifier = () => {
  // generate code verifier
  const generatedCode = gen64x8bitNonce();
  // base64 encode code_verifier
  return base64Unicode(generatedCode.buffer);
};

export const getAuthURL = async (clientId, clientSecret, redirectURL, codeVerifier) => {
  const challengeBuffer = await digestVerifier(codeVerifier);
  // base64 encode the challenge
  const challenge = base64Unicode(challengeBuffer);
  // build authUrl
  const authUrl = 'https://identity.pagerduty.com/oauth/authorize?'
    + `client_id=${clientId}&`
    + `client_secret=${clientSecret}&`
    + `redirect_uri=${redirectURL}&`
    + 'response_type=code&'
    + `code_challenge=${encodeURI(challenge)}&`
    + 'code_challenge_method=S256';
  return authUrl;
};

export const exchangeCodeForToken = async (
  clientId,
  clientSecret,
  redirectURL,
  codeVerifier,
  code,
) => {
  const postData = async (url, data) => {
    const formData = new URLSearchParams(data); // Convert data to URL-encoded form data
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Set the content type
      },
      body: formData.toString(), // Convert the form data to a string
    });
    const json = await response.json(); // Parse the response JSON
    return json;
  };

  const requestTokenUrl = 'https://identity.pagerduty.com/oauth/token';
  const formData = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectURL,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: codeVerifier,
  };

  const data = await postData(requestTokenUrl, formData);
  return data;
};

// eslint-disable-next-line no-unused-vars
export const revokeToken = async (token, clientId, clientSecret) => {
  const revokeUrl = 'https://identity.pagerduty.com/oauth/revoke?'
    + `token=${token}`
    + `&client_id=${clientId}`
    + `&client_secret=${clientSecret}`;
  await fetch(revokeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
