/*
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * This file has been modified from the original.
 * Modifications are subject to the CC0 1.0 Universal public domain dedication.
 *
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Auth, Security, SecureRoute, ImplicitCallback } from '@okta/okta-react';
import { Container } from 'semantic-ui-react';
import config from './.samples.config';
import Home from './Home';
import ServiceHistory from './ServiceHistory';
import DisabilityRating from './DisabilityRating';
import Navbar from './Navbar';
import Profile from './Profile';

class FixedAuth extends Auth {
  async login(fromUri, additionalParams, redirectOptions = {}) {
    const referrerPath = fromUri
      ? { pathname: fromUri }
      : this._history.location;
    localStorage.setItem(
      'secureRouterReferrerPath',
      JSON.stringify(referrerPath)
    );
    if (this._config.onAuthRequired) {
      const auth = this;
      const history = this._history;
      return this._config.onAuthRequired({ auth, history });
    }
    await this.redirect(additionalParams, redirectOptions);
  }

  async redirect(additionalParams = {}, redirectOptions = {}) {
    const responseType = additionalParams.response_type
      || this._config.response_type
      || ['id_token', 'token'];

    const scopes = additionalParams.scope
      || this._config.scope
      || ['openid', 'email', 'profile'];

    this._oktaAuth.token.getWithRedirect({
      responseType: responseType,
      scopes: scopes,
      ...additionalParams
    }, redirectOptions);

    // return a promise that doesn't terminate so nothing
    // happens after setting window.location
    return new Promise((resolve, reject) => {});
  }
}

class App extends Component {
  render() {
    let auth = new FixedAuth({
      issuer: config.oidc.issuer,
      client_id: config.oidc.clientId,
      redirect_uri: config.oidc.redirectUri,
      scope: config.oidc.scope,
      idp: config.oidc.idp,
    });

    return (
      <Router>
        <Security auth={auth}>
          <Navbar />
          <Container text style={{ marginTop: '7em' }}>
            <Route path="/" exact component={Home} />
            <Route path="/implicit/callback" component={ImplicitCallback} />
            <SecureRoute path="/servicehistory" component={ServiceHistory} />
            <SecureRoute path="/disabilityrating" component={DisabilityRating} />
            <SecureRoute path="/profile" component={Profile} />
          </Container>
        </Security>
      </Router>
    );
  }
}

export default App;
