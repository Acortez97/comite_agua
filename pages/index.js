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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '1px',
      backgroundColor: '#e0f7fa',
      color: '#00796b',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '3.1rem',
        fontWeight: '700',
        marginBottom: '50px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
      }}>
        Bienvenido al Portal de Administración del Comité de Agua
      </h1>

      <img
        src="/agua.png"
        alt="Icono Comité del Agua"
        style={{
          width: '200px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 121, 107, 0.4)'
        }}
      />
    </div>
  )
}
