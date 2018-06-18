import React from 'react';
import { Segment, Loader } from 'semantic-ui-react';

const ComponentLoader = ({ loaded, message, children }) => {
  if(loaded)
    return children
  else
    return(
      <Segment>
        <Loader>{message}...</Loader>
      </Segment>
    )
}

export default ComponentLoader;
