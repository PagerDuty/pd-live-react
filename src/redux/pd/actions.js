export const PD_API_SET_AUTH = 'PD_API_SET_AUTH';

export const PD_API_CALL_REQUESTED = 'PD_API_CALL_REQUESTED';
export const PD_API_CALL_COMPLETED = 'PD_API_CALL_COMPLETED';
export const PD_API_CALL_ERROR = 'PD_API_CALL_ERROR';

export const pdApiSetAuth = (accessToken, refreshToken, expiresAt) => ({
  type: PD_API_SET_AUTH,
  accessToken,
  refreshToken,
  expiresAt,
});

export const pdApiCall = (method, endpoint, params = {}, data = {}) => ({
  type: PD_API_CALL_REQUESTED,
  method,
  endpoint,
  params,
  data,
});
