import React from 'react';
import { GoogleLogout } from 'react-google-login';
import { Button, Icon } from "semantic-ui-react";

const clientId =
  '787844068457-38ubcdtp9moimvtq3a1du037nphmo8ee.apps.googleusercontent.com';

const Logout = (props) => {
  const onSuccess = () => {
    console.log('Logout made successfully');
    localStorage.clear();
    window.open('/signin', "_self");
  };

  return (
    <div>
      <GoogleLogout
        clientId={clientId}
        buttonText="Logout"
        onLogoutSuccess={onSuccess}
        render={renderProps => (
          <Button onClick={renderProps.onClick} disabled={renderProps.disabled} icon labelPosition='right' negative>
            <Icon name="sign-out"/>
            Log out
          </Button>
        )}
      ></GoogleLogout>
    </div>
  );
}

export default Logout;