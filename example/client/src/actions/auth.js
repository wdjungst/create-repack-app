import axios from 'axios';
import { setFlash } from '../actions/flash';

export const registerUser = (email, password, passwordConfirmation, history) => {
  return(dispatch) => {
    axios.post('/api/auth', { email, password, password_confirmation: passwordConfirmation })
      .then( res => {
        let { data: { data: user }, headers } = res;
        dispatch({ type: 'LOGIN', user, headers });
        history.push('/');
      })
      .catch( res => {
        const message = res.response.data.errors.join(',');
        dispatch(setFlash(message, 'error'));
    });
  }
}

export const handleLogout = (history) => {
  return(dispatch) => {
    axios.delete('/api/auth/sign_out')
      .then( res => {
        dispatch({ type: 'LOGOUT' });
        dispatch(setFlash('Logged out successfully!', 'success'));
        history.push('/login');
      })
      .catch( res => {
        const message = res.response.data.errors.join(',');
        dispatch(setFlash(message, 'error'));
      });
    }
}

export const handleLogin = (email, password, history) => {
  return(dispatch) => {
    axios.post('/api/auth/sign_in', { email, password })
      .then( res => {
        let { data: { data: user }, headers } = res
        dispatch({ type: 'LOGIN', user, headers });
        history.push('/');
      })
      .catch( res => {
        const message = res.response.data.errors.join(',');
        dispatch(setFlash(message, 'error'));
      })
  }
}

export const validateToken = (cb = f => f) => {
  return (dispatch) => {
    dispatch({ type: 'VALIDATE_TOKEN' })
    let headers = axios.defaults.headers.common
    axios.get('/api/auth/validate_token', headers)
      .then( res => dispatch({ type: 'LOGIN', user: res.data.data }) )
      .catch(() => cb())
  }
}
