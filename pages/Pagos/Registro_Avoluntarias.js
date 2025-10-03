import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withAuthRole from '../../components/withAuthRole';
import { jsPDF } from 'jspdf';

function RegistroAportacionVoluntaria() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [contratoSeleccionado, setContratoSeleccionado] = useState('');
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [num_contrato, setNum_contrato] = useState('');
  const [lastUsuarioConsultado, setLastUsuarioConsultado] = useState(null);
  const [fechaAportacion, setFechaAportacion] = useState('');

  const [contrato, setContrato] = useState([]);

  const logoUrl = '/logoagua.png';

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
        if (!data.error) setContrato(data);
        else setContrato([]);
      })
      .catch((err) => {
        console.error('Error al obtener contratos:', err);
        setContrato([]);
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
      fecha_aportacion: fechaAportacion,
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

      generarPDF({
        usuario: usuarios.find(u => String(u.id_usuario) === String(usuarioSeleccionado))?.Contratante || '',
        num_contrato,
        fechaAportacion,
        monto,
        metodo,
        observaciones,
        fecha_registro: getFechaLocal(),
      });
      // Limpiar formulario
      setUsuarioSeleccionado('');
      setContratoSeleccionado('');
      setMonto('');
      setMetodo('');
      setNum_contrato('');
      setObservaciones('');
      setBusquedaUsuario('');
      setContratos([]);
      setFechaAportacion('')
    } catch (error) {
      Swal.fire({ icon: 'error', title: '¡Error!', text: error.message });
    }
  };

  function generarPDF(info) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 👉 Logo y encabezado
    const logoSize = 30;
    doc.addImage(logoUrl, 'PNG', 15, 10, logoSize, logoSize);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Comité del Agua Potable', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('San Gaspar Tlahuelilpan, Metepec, Estado de México', pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fecha de expedición: ${info.fecha_registro}`, pageWidth - 15, 35, { align: 'right' });

    // 👉 Título del recibo
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGO', pageWidth / 2, 50, { align: 'center' });

    // 👉 Cuerpo del recibo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`CONCEPTO: APORTACIÓN VOLUNTARIA`, pageWidth - 15, 58, { align: 'right' });
    const startY = 65;
    const lineHeight = 10;
    const fields = [
      [`Nombre del Contratante`, info.usuario],
      [`Número de Contrato`, info.num_contrato],
      [`Fecha de Aportación`, info.fechaAportacion],
      [`Monto Pagado`, `$${parseFloat(info.monto).toFixed(2)}`],
      [`Método de Pago`, info.metodo],
      [`Observaciones`, info.observaciones || 'Ninguna'],
    ];

    fields.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 30, startY + i * lineHeight);

      doc.setFont('helvetica', 'normal');
      doc.text(`${value}`, 90, startY + i * lineHeight);
    });

    // 👉 Línea de separación
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(15, startY + fields.length * lineHeight + 10, pageWidth - 15, startY + fields.length * lineHeight + 10);

    // 👉 Aviso / nota legal
    const footerY = startY + fields.length * lineHeight + 25;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Este recibo certifica que el pago por concepto de aportación voluntaria ha sido realizado correctamente \n' +
      'ante el Comité del Agua Potable. Guarde este documento como comprobante oficial.\n\n' +
      'Aviso de privacidad: Los datos personales aquí registrados serán utilizados únicamente para fines administrativos\n' +
      'y de control interno del sistema de agua de San Gaspar Tlahuelilpan, Metepec, Edo. de México.',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );

    doc.save(`ReciboPago_${info.num_contrato}_${info.anio_pago}.pdf`)
    // 👉 Abrir PDF en nueva pestaña
    const pdfBlobUrl = doc.output('bloburl');
    window.open(pdfBlobUrl, '_blank');
  }


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
            onChange={(e) => {
              const selectedId = e.target.value;
              setContratoSeleccionado(selectedId);
              const contratoEncontrado = contrato.find(c => c.id_contrato == selectedId);
              setNum_contrato(contratoEncontrado ? contratoEncontrado.num_contrato : '');
            }}
            style={inputStyle}
          >
            <option value="">SELECCIONE UN CONTRATO</option>
            {contrato.map((contrato) => (
              <option key={contrato.id_contrato} value={contrato.id_contrato}>
                {contrato.num_contrato}
              </option>
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
          <select
            required
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            style={inputStyle}
          >
            <option value="">SELECCIONE UN MÉTODO</option>
            {["EFECTIVO", "TRANSFERENCIA", "TARJETA"].map(mes => (
              <option key={mes} value={mes}>{mes}</option>
            ))}
          </select>
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
