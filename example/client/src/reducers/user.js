import React from 'react';
import axios from 'axios';
import { setFlash } from './flash';
import { setHeaders } from './headers';
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';
const VALIDATE_TOKEN = 'VALIDATE_TOKEN';

const login = (user) => {
  return { type: LOGIN, user };
}

const logout = () => {
  return { type: LOGOUT };
}

export const registerUser = (user, history) => {
  return (dispatch) => {
    axios.post('/api/auth', user)
    .then( (res) => {
      const { data: { data: user }, headers } = res;
      dispatch(setHeaders(headers));
      dispatch(login(user));
      history.push('/')
    })
    .catch( res => {
      const messages =
        res.response.data.errors.full_messages.map(message =>
          <div>{message}</div>);
        const { headers } = res;
        dispatch(setHeaders(headers));
        dispatch(setFlash(messages, 'red'));
    })
  }
}

export const handleLogout = history => {
  return (dispatch) => {
    axios.delete('/api/auth/sign_out')
      .then(res => {
        const { headers } = res;
        dispatch(setHeaders(headers));
        dispatch(logout());
        dispatch(setFlash('Logged out successfully!', 'green'));
        history.push('/login');
      })
      .catch(res => {
        let errors = res.response.data.errors ? res.response.data.errors : ['Something went wrong']
        if (!Array.isArray(errors))
          errors = [errors]
        const messages =
          errors.map( (message, i) =>
            <div key={i}>{message}</div>);
        const { headers } = res;
        dispatch(setHeaders(headers));
        dispatch(setFlash(messages, 'red'));
      });
  };
};

export const handleLogin = (user, history) => {
  return (dispatch) => {
    axios.post('/api/auth/sign_in', user)
      .then(res => {
        const { data: { data: user }, headers } = res;
        dispatch(setHeaders(headers));
        dispatch(login(user));
        history.push('/');
      })
      .catch(res => {
        let errors = res.response.data.errors ? res.response.data.errors : ['Something went wrong']
        if (!Array.isArray(errors))
          errors = [errors]
        const messages =
          errors.map( (message, i) =>
            <div key={i}>{message}</div>);
        const { headers } = res;
        dispatch(setHeaders(headers));
        dispatch(setFlash(messages, 'red'));
      });
  };
};

export const validateToken = (callBack = f => f) => {
  return (dispatch) => {
    dispatch({ type: VALIDATE_TOKEN });
    const headers = axios.defaults.headers.common;
    axios.get('/api/auth/validate_token', headers)
      .then(res => {
        const user = res.data.data;
        dispatch(setHeaders(res.headers));
        dispatch(login(user));
        callBack()
      })
      .catch(() => callBack());
  };
};

export default (state = {}, action) => {
  switch (action.type) {
    case LOGIN:
    return action.user;
    case LOGOUT:
    return {};
    default:
    return state;
  }
};

