import { Component, } from 'react';
import { withRouter, } from 'react-router-dom';

class ScrollToTop extends Component {

  componentDidUpdate() {
      window.scrollTo(0,0);
  };

  render() {
    return this.props.children;
  };

};

export default withRouter(ScrollToTop);
