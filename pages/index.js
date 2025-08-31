// pages/index.js

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Home() {

    const router = useRouter()
  return (
    <div>
       <div>
      <h1>Bienvenido al Portal de Administración del Comite de Agua</h1>
      
      <button onClick={() => router.push('/Registro_usuarios')}>Ir a Registrar usuarios</button>
    </div>
    </div>
  )
}
