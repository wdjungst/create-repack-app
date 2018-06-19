const SET_FLASH = 'SET_FLASH';
const CLEAR_FLASH = 'CLEAR_FLASH';

export const setFlash = (message, color) => {
  return { type: SET_FLASH, message, color };
};

export const clearFlash = () => {
  return { type: CLEAR_FLASH };
};

export default (state = {}, action) => {
  switch (action.type) {
    case SET_FLASH:
      return { message: action.message, color: action.color };
    case CLEAR_FLASH:
      return {};
    default:
      return state;
  }
};

