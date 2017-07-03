export const setFlash = (message, msgType) => {
  return { type: 'SET_FLASH', message, msgType };
}

export const clearFlash = () => {
  return { type: 'CLEAR_FLASH' }
}
