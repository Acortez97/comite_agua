import React from 'react'
import './styles/globals.css' // Importa tus estilos globales

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp