import { useEffect, useState } from 'react'
import { alCambiarModo, modoDemo } from './api.js'

export const useModoDemo = () => {
  const [demo, setDemo] = useState(modoDemo)
  useEffect(() => alCambiarModo(setDemo), [])
  return demo
}
