import React from 'react';

import { GoogleLogin } from 'react-google-login';
// refresh token
import { refreshTokenSetup } from '../utils';

const clientId =
  '787844068457-38ubcdtp9moimvtq3a1du037nphmo8ee.apps.googleusercontent.com';

const Login = (props) => {
  const onSuccess = (res) => {
    refreshTokenSetup(res);
  };

  const onFailure = (res) => {
    console.log('Login failed: res:', res);
    alert(
      `Failed to login.`
    );
  };

  return (
     <GoogleLogin
        clientId={clientId}
        buttonText="Login"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
        style={{ marginTop: '100px' }}
        hostedDomain="cedarville.edu"
        isSignedIn={false}
        prompt="consent"
        fetchBasicProfile={false}
      />
  );
}

export default Login;