import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';



// Define las columnas acorde a tus datos
const columns = [
    { id: 'id_usuario', label: 'ID Usuario', minWidth: 50 },
    { id: 'Nombre', label: 'Nombre', minWidth: 100 },
    { id: 'Apellido_pat', label: 'Apellido Paterno', minWidth: 150 },
    { id: 'Apellido_mat', label: 'Apellido Materno', minWidth: 150 },
    { id: 'num_celular', label: 'Número Celular', minWidth: 120 },
    { id: 'correo', label: 'Correo', minWidth: 200 },
];

export default function Ver_usuarios() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // 🔵 Función para obtener usuarios
    const getDataUser = () => {
        fetch('/api/Selectgeneric/Select_Gen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                select: '*',
                table: 'usuarios',
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data || data.error) {
                    setData([]);
                } else {
                    setData(data);
                }
            })
            .catch((error) => {
                console.error('Error al obtener datos:', error);
                setData([]);
            });
    };

    useEffect(() => {
        getDataUser();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (

        <Paper sx={{ width: '90%', overflow: 'hidden', margin: 'auto' }}>
            <br />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <label style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Visualizar Usuarios</label>
            </div>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="tabla usuarios">
                    <TableHead >
                        <TableRow >
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    style={{ minWidth: column.minWidth }}
                                    align={column.align || 'left'} sx={{ backgroundColor: '#000', color: 'white' }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                                <TableRow hover tabIndex={-1} key={row.id_usuario} >
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={column.id} align={column.align || 'left'}>
                                                {value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
           
        </Paper>
    );
}
