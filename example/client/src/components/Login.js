import React, { Component } from 'react';
import { Header, Segment, Form, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { handleLogin } from '../reducers/user';

class Login extends Component {
  state = { email: '', password: '' };

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { dispatch, history } = this.props;
    dispatch(handleLogin(this.state, history));
  }

  render() {
    const { email, password } = this.state;
    return (
      <Segment basic>
        <Header as="h1" textAlign="center">Login</Header>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label htmlFor="email">Email</label>
            <input
              required
              id="email"
              name="email"
              value={email}
              placeholder="Email"
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <label htmlFor="password">Password</label>
            <input
              required
              id="password"
              name="password"
              value={password}
              placeholder="Password"
              type="password"
              onChange={this.handleChange}
            />
          </Form.Field>
          <Segment textAlign="center" basic>
            <Button primary type="submit">Submit</Button>
          </Segment>
        </Form>
      </Segment>
    );
  }
}

export default connect()(Login);

