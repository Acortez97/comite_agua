import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withAuthRole from '../../components/withAuthRole';

function Registro_contratos() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [num_contrato, setNum_contrato] = useState('');
  const [Fecha_contrato, setFecha_contrato] = useState('');
  const [respon_comite, setRespon_comite] = useState('');

  const [usuarios, setUsuarios] = useState([]);

  // Cargar usuarios al montar
  useEffect(() => {
    fetch('/api/Selectgeneric/Select_Gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        select: 'id_usuario, CONCAT_WS(" ",Nombre, Apellido_pat, Apellido_mat) AS Contratante',
        table: 'usuarios',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUsuarios(data);
      })
      .catch((err) => console.error('Error al obtener usuarios:', err));
  }, []);

  // Fecha local en formato YYYY-MM-DD HH:mm:ss
  function getFechaLocal() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    const año = now.getFullYear();
    const mes = pad(now.getMonth() + 1);
    const dia = pad(now.getDate());
    const horas = pad(now.getHours());
    const minutos = pad(now.getMinutes());
    const segundos = pad(now.getSeconds());

    return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  }

  // Limpiar formulario
  function borrar() {
    setUsuarioSeleccionado('');
    setNum_contrato('');
    setFecha_contrato('');
    setRespon_comite('');
    setBusquedaUsuario('');
  }

  // Guardar contrato
  const guardarContrato = async () => {
    if (!usuarioSeleccionado) {
      Swal.fire({ icon: 'error', title: '¡Error!', text: 'El USUARIO es OBLIGATORIO.' });
      return;
    }

    const payload = {
      id_usuario: usuarioSeleccionado,
      num_contrato: num_contrato,
      Fecha_contrato: Fecha_contrato,
      respon_comite: respon_comite,
      status: 1,
    };

    const data = { table: 'contratos', data: { ...payload, fecha_creacion: getFechaLocal() } };

    try {
      const response = await fetch('/api/InsertGeneral/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const results = await response.json();

      if (!response.ok) throw new Error(results?.error || 'Error al insertar');

      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Los datos se han guardado correctamente.',
      });

      borrar();
    } catch (error) {
      console.error('Error al guardar contrato:', error);
      Swal.fire('Error', 'Ocurrió un error al guardar el contrato.', 'error');
    }
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
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Registro de Contratos</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          guardarContrato();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Buscador usuario */}
        <div>
          <label><b>Buscar Usuario:</b></label>
          <input
            type="text"
            placeholder="Escribe el nombre del contratante"
            value={busquedaUsuario}
            onChange={(e) => setBusquedaUsuario(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Lista usuarios filtrados */}
        <div>
          <label><b>Nombre:</b></label>
          <select
            required
            value={usuarioSeleccionado}
            onChange={(e) => setUsuarioSeleccionado(e.target.value)}
            style={inputStyle}
          >
            <option value="">SELECCIONE EL CONTRATANTE</option>
            {usuarios
              .filter((usuario) =>
                usuario.Contratante.toLowerCase().includes(busquedaUsuario.toLowerCase())
              )
              .map((usuario) => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.Contratante}
                </option>
              ))}
          </select>
        </div>

        {/* Número de contrato */}
        <div>
          <label><b>Número de contrato:</b></label>
          <input
            type="text"
            placeholder="INGRESA NÚMERO DE CONTRATO"
            value={num_contrato}
            onChange={(e) => setNum_contrato(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Fecha del contrato */}
        <div>
          <label><b>Fecha del Contrato:</b></label>
          <input
            type="datetime-local"
            value={Fecha_contrato}
            onChange={(e) => setFecha_contrato(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Responsable del comité */}
        <div>
          <label><b>Responsable del Comité:</b></label>
          <select
            required
            value={respon_comite}
            onChange={(e) => setRespon_comite(e.target.value)}
            style={inputStyle}
          >
            <option value="">SELECCIONE UN RESPONSABLE</option>
            <option value="Presidente">Presidente</option>
            <option value="Secretario">Secretario</option>
            <option value="Tesorero">Tesorero</option>
            <option value="Auxiliar">Auxiliar</option>
            <option value="Voluntario">Voluntario</option>
          </select>
        </div>

        <button type="submit" style={buttonStyle}>
          Registrar Contrato
        </button>
      </form>
    </div>
  );
}

export default withAuthRole(Registro_contratos, ['admin']);

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
