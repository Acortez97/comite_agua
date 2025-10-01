import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function Editar_usuarios() {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    if (!userId.trim()) {
      Swal.fire('Error', 'Por favor ingresa un ID de usuario', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/Selectgeneric/Select_Gen/${userId}`); // Cambia la ruta según tu API
      if (!res.ok) throw new Error('Usuario no encontrado');
      const data = await res.json();
      setUserData(data);
    } catch (error) {
      Swal.fire('Error', error.message || 'Error al cargar usuario', 'error');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (!userData) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error('Error al guardar cambios');
      Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
    } catch (error) {
      Swal.fire('Error', error.message || 'Error al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>Editar Usuarios</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Ingresa ID de usuario"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ padding: 10, width: '70%', marginRight: 10 }}
          disabled={loading}
        />
        <button onClick={fetchUser} disabled={loading}>
          {loading ? 'Cargando...' : 'Buscar'}
        </button>
      </div>

      {userData && (
        <form onSubmit={guardarCambios} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <label>
            Nombre:
            <input
              type="text"
              name="Nombre"
              value={userData.Nombre || ''}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label>
            Apellido Paterno:
            <input
              type="text"
              name="Apellido_pat"
              value={userData.Apellido_pat || ''}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>

          <label>
            Apellido Materno:
            <input
              type="text"
              name="Apellido_mat"
              value={userData.Apellido_mat || ''}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>

          <label>
            Número celular:
            <input
              type="text"
              name="num_celular"
              value={userData.num_celular || ''}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>

          <label>
            Correo:
            <input
              type="email"
              name="correo"
              value={userData.correo || ''}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>

          <label>
            Domicilio:
            <input
              type="text"
              name="domicilio"
              value={userData.domicilio || ''}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '1rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  marginTop: '5px',
};

const buttonStyle = {
  padding: '12px 20px',
  backgroundColor: '#0077b6',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};
