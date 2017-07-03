import React from 'react';
import { connect } from 'react-redux';
import { clearFlash } from '../actions/flash';
import '../styles/flash.css';
import { Button } from 'semantic-ui-react';

const fadeFlash = (dispatch) => {
  setTimeout( () => {
    dispatch(clearFlash());
  }, 15000)
}

const Flash = ({ flash, dispatch }) => {
  if(flash.message) {
    return(
      <div
        id='alert'
        className={`alert alert-${flash.msgType}`}
        style={{ width: '90%', margin: '0 auto'}}
      >
        { flash.message }
        { fadeFlash(dispatch) }
        <Button onClick={ () => dispatch(clearFlash()) }> X </Button>
      </div>
    )
  } else {
    return null;
  }
}

const mapStateToProps = (state) => {
  return { flash: state.flash };
}

export default connect(mapStateToProps)(Flash);
