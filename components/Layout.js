import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div style={styles.wrapper}>
      <Navbar />
      <main className="container" style={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
  },
}
