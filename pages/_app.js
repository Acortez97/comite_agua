// pages/_app.js
import '../styles/globals.css'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/authContext'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>COMITE DEL AGUA</title>
        <meta name="description" content="Administración del sistema de agua." />
        <link rel="icon" href="/agua.png" />
      </Head>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </>
  )
}

export default MyApp
