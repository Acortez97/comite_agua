// components/withAuthRole.js
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../context/authContext'
import Swal from 'sweetalert2'

const withAuthRole = (WrappedComponent, allowedRoles = []) => {
  const ProtectedComponent = (props) => {
    const { user, logout, loading } = useContext(AuthContext)
    const router = useRouter()

    const handleLogout = () => {
      logout()
      window.location.href = "/login"
    }

    useEffect(() => {
      if (loading) return // Espera a que termine de cargar

      if (!user) {
        Swal.fire({
          icon: 'warning',
          title: 'Sesión no iniciada',
          text: 'Por favor inicia sesión',
          timer: 1500,
          showConfirmButton: false,
        })
        handleLogout()
        return
      }

      if (!allowedRoles.includes(user.rol)) {
        Swal.fire({
          icon: 'error',
          title: 'No autorizado',
          text: 'No tienes permiso para acceder a esta página',
          timer: 1500,
          showConfirmButton: false,
        })
        handleLogout()
      }
    }, [user, loading])

    if (loading) return null // O puedes poner un loader
    if (!user || !allowedRoles.includes(user.rol)) return null

    return <WrappedComponent {...props} />
  }

  return ProtectedComponent
}

export default withAuthRole
