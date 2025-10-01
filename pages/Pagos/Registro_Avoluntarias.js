import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withAuthRole from '../../components/withAuthRole';

function RegistroAportacionVoluntaria() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [contratoSeleccionado, setContratoSeleccionado] = useState('');
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [lastUsuarioConsultado, setLastUsuarioConsultado] = useState(null);
  const [fechaAportacion, setFechaAportacion] = useState('');


  // Obtener fecha local
  const getFechaLocal = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  // Fetch de usuarios
  useEffect(() => {
    fetch('/api/Selectgeneric/Select_Gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        select: 'id_usuario, CONCAT_WS(" ", Nombre, Apellido_pat, Apellido_mat) AS Contratante',
        table: 'usuarios',
      }),
    })
      .then((res) => res.json())
      .then((data) => { if (!data.error) setUsuarios(data); })
      .catch((err) => console.error('Error al obtener usuarios:', err));
  }, []);

  // Fetch de contratos por usuario
  useEffect(() => {
    if (!usuarioSeleccionado || usuarioSeleccionado === lastUsuarioConsultado) return;

    setLastUsuarioConsultado(usuarioSeleccionado);
    fetch('/api/Selectgeneric/SelectWithWhere', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        select: 'id_contrato, num_contrato',
        table: 'contratos',
        column: 'id_usuario',
        id: usuarioSeleccionado,
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setContratos(data);
        else setContratos([]);
      })
      .catch((err) => {
        console.error('Error al obtener contratos:', err);
        setContratos([]);
      });
  }, [usuarioSeleccionado, lastUsuarioConsultado]);

  // Guardar aportación
  const guardarAportacion = async () => {
    if (!usuarioSeleccionado || !contratoSeleccionado || !monto || !metodo) {
      Swal.fire({ icon: 'error', title: '¡Error!', text: 'Todos los campos son obligatorios (excepto observaciones).' });
      return;
    }

    const payload = {
      id_usuario: usuarioSeleccionado,
      id_contrato: contratoSeleccionado,
      fecha_aportacion:fechaAportacion,
      monto,
      metodo,
      observaciones,
      fecha_registro: getFechaLocal()
    };

    const data = {
      table: 'aportacion_voluntaria',
      data: payload
    };

    try {
      const response = await fetch('/api/InsertGeneral/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Error al insertar');

      Swal.fire({ icon: 'success', title: '¡Registro exitoso!', text: 'La aportación voluntaria ha sido registrada.' });

      // Limpiar formulario
      setUsuarioSeleccionado('');
      setContratoSeleccionado('');
      setMonto('');
      setMetodo('');
      setObservaciones('');
      setBusquedaUsuario('');
      setContratos([]);
    } catch (error) {
      Swal.fire({ icon: 'error', title: '¡Error!', text: error.message });
    }
  };

  return (
    <div style={formContainerStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Aportación Voluntaria</h1>

      <form onSubmit={(e) => { e.preventDefault(); guardarAportacion(); }} style={formStyle}>
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

        <div>
          <label><b>Nombre del Usuario:</b></label>
          <select
            required
            value={usuarioSeleccionado}
            onChange={(e) => setUsuarioSeleccionado(e.target.value)}
            style={inputStyle}
          >
            <option value="">SELECCIONE EL CONTRATANTE</option>
            {usuarios
              .filter(usuario =>
                usuario.Contratante.toLowerCase().includes(busquedaUsuario.toLowerCase())
              )
              .map(usuario => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.Contratante}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label><b># Contrato:</b></label>
          <select
            required
            value={contratoSeleccionado}
            onChange={(e) => setContratoSeleccionado(e.target.value)}
            style={inputStyle}
          >
            <option value="">SELECCIONE UN CONTRATO</option>
            {contratos.map(c => (
              <option key={c.id_contrato} value={c.id_contrato}>{c.num_contrato}</option>
            ))}
          </select>
        </div>
        <div>
          <label><b>Fecha de Aportación:</b></label>
          <input
            type="datetime-local"
            value={fechaAportacion}
            onChange={(e) => setFechaAportacion(e.target.value)}
            style={inputStyle}
            required
          />
        </div>


        <div>
          <label><b>Monto:</b></label>
          <input
            type="number"
            placeholder="Ej. 150.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label><b>Método de Pago:</b></label>
          <input
            type="text"
            placeholder="Ej. EFECTIVO, TRANSFERENCIA"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label><b>Observaciones:</b></label>
          <input
            type="text"
            placeholder="Opcional"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button type="submit" style={buttonStyle}>Guardar Aportación</button>
      </form>
    </div>
  );
}

export default withAuthRole(RegistroAportacionVoluntaria, ['admin']);

// 🔧 Estilos
const formContainerStyle = {
  maxWidth: '600px',
  margin: '40px auto',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '0.95rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  marginTop: '5px'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#0077b6',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '10px'
};
