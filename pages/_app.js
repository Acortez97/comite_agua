import React from 'react'
import '../styles/globals.css' // Importa tus estilos globales
import Layout from '../components/Layout'



function MyApp({ Component, pageProps }) {


  return(
  <Layout>
    <Component {...pageProps} />
  </Layout>
  )
}

export default MyApp