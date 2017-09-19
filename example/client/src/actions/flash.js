export const setFlash = (message, color) => {
  return { type: 'SET_FLASH', message, color };
};

export const clearFlash = () => {
  return { type: 'CLEAR_FLASH' };
};
