import React, { useEffect, useCallback } from 'react'

const KeyboardContext = () => {

  const onKeyPressDown = useCallback((event) => {
    console.log(`Key pressed: ${event.key}`)
  }, [])
  const onKeyPressUp = useCallback((event) => {
    console.log(`Key released: ${event.key}`)
  }, [])
  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', onKeyPressDown)
    document.addEventListener('keyup', onKeyPressUp)
    // remove the event listener
    return () => {
      document.removeEventListener('keydown', onKeyPressDown)
      document.removeEventListener('keyup', onKeyPressUp)
    };
  }, [onKeyPressDown, onKeyPressUp])

  return (
    <div>KeyboardContext</div>
  )
}

export default KeyboardContext