import axios from 'axios';

var API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

var API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

API.interceptors.request.use(function (config) {
  var token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

API.interceptors.response.use(
  function (res) { return res; },
  async function (err) {
    var original = err.config;
    if (err.response && err.response.status === 401 && !original._retry) {
      original._retry = true;
      try {
        var res = await axios.post(API_BASE + '/auth/refresh', {}, { withCredentials: true });
        localStorage.setItem('token', res.data.data.accessToken);
        original.headers.Authorization = 'Bearer ' + res.data.data.accessToken;
        return API(original);
      } catch (e) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default API;