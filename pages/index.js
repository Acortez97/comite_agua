// pages/index.js
/*
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Home() {

    const router = useRouter()
  return (
    <div>
       <div>
        <br/>
      <h1 style={{textAlign:'center'}}>Bienvenido al Portal de Administración del Comite de Agua</h1>
      
     
    </div>
    </div>
  )
}
*/
// pages/index.js
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))

    if (!user) {
      router.push('/login')  // Redirige al login si no hay sesión
    }
  }, [])

  return (
    <div>
      <br />
      <h1 style={{ textAlign: 'center' }}>Bienvenido al Portal de Administración del Comité de Agua</h1>
    </div>
  )
}
