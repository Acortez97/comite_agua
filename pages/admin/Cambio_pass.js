import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withAuthRole from '../../components/withAuthRole';

function Actualizar_pass() {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pass, setPass] = useState('');

  // Cargar usuarios al montar el componente
  useEffect(() => {
    async function fetchUsuarios() {
      const res = await fetch('/api/Selectgeneric/Select_admins'); // API que lista usuarios
      const data = await res.json();
      setUsuarios(data);
    }
    fetchUsuarios();
  }, []);

  const actualizarPass = async () => {
    if (!selectedUserId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Selecciona un usuario.' });
      return;
    }
    if (!pass) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Ingresa la nueva contraseña.' });
      return;
    }

    const response = await fetch('/api/UpdateGeneral/update_pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idusers: selectedUserId, newPass: pass }),
    });
    const data = await response.json();

    if (!response.ok) {
      Swal.fire({ icon: 'error', title: 'Error', text: data.error || 'Error al actualizar' });
      return;
    }

    Swal.fire({ icon: 'success', title: 'Contraseña actualizada', text: data.message });
    setPass('');
    setSelectedUserId('');
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '40px auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Actualizar Contraseña</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          actualizarPass();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <div>
          <label><b>Usuario:</b></label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Selecciona un usuario --</option>
            {usuarios.map((u) => (
              <option key={u.idusers} value={u.idusers}>
                {u.usuario} ({u.nombre} {u.apellido})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label><b>Nueva Contraseña:</b></label>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button type="submit" style={buttonStyle}>
          Actualizar Contraseña
        </button>
      </form>
    </div>
  );
}

export default withAuthRole(Actualizar_pass, ['admin']);

// Estilos reutilizables
const inputStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '0.95rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  marginTop: '5px',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#0077b6',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '10px',
};
