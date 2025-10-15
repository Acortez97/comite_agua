import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
    TableRow, TableSortLabel, Toolbar, Typography, Paper, Checkbox, IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const headCells = [
    { id: 'Nombre', numeric: false, disablePadding: true, label: 'Nombre' },
    { id: 'Apellido_pat', numeric: false, disablePadding: false, label: 'Apellido Paterno' },
    { id: 'Apellido_mat', numeric: false, disablePadding: false, label: 'Apellido Materno' },
    { id: 'num_celular', numeric: false, disablePadding: false, label: 'Celular' },
    { id: 'correo', numeric: false, disablePadding: false, label: 'Correo' },
    { id: 'domicilio', numeric: false, disablePadding: false, label: 'Domicilio' },
    { id: 'edit', numeric: false, disablePadding: false, label: 'Editar' },
    { id: 'delete', numeric: false, disablePadding: false, label: 'Eliminar' },
];

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property) => (event) => onRequestSort(event, property);

    return (
        <TableHead>
            <TableRow sx={{ backgroundColor: '#000' }}>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        checked={rowCount > 0 && numSelected === rowCount}
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{ 'aria-label': 'select all users' }}
                        sx={{ color: 'white' }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align="left"
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ color: 'white' }}
                    >
                        {headCell.id === 'edit' || headCell.id === 'delete' ? (
                            headCell.label
                        ) : (
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                                sx={{ color: 'white', '&.Mui-active': { color: 'white' } }}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar({ numSelected }) {
    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                component="div"
                color={numSelected > 0 ? 'inherit' : 'primary'}
            >
                {numSelected > 0 ? `${numSelected} seleccionado(s)` : 'Usuarios'}
            </Typography>
        </Toolbar>
    );
}

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
};

const buttonStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#1976d2',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
};

function EditUserForm({ user, onSave, onCancel }) {
    const [nombreUsuario, setNombreUsuario] = React.useState(user.Nombre || '');
    const [ap_pat, setAp_pat] = React.useState(user.Apellido_pat || '');
    const [ap_mat, setAp_mat] = React.useState(user.Apellido_mat || '');
    const [num_cel, setNum_cel] = React.useState(user.num_celular || '');
    const [correo, setCorreo] = React.useState(user.correo || '');
    const [domicilio, setDomicilio] = React.useState(user.domicilio || '');
    const [loading, setLoading] = React.useState(false);

    const guardarUsuario = async () => {
        setLoading(true);
        try {
            const updates = {
                Nombre: nombreUsuario,
                Apellido_pat: ap_pat,
                Apellido_mat: ap_mat,
                num_celular: num_cel,
                correo: correo,
                domicilio: domicilio,
            };

            const res = await fetch('/api/UpdateGeneral/update_generic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: 'usuarios',
                    updates,
                    idField: 'id_usuario',
                    idValue: user.id_usuario,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al actualizar');
            }

            const updatedUser = { ...user, ...updates };
            onSave(updatedUser);
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                guardarUsuario();
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}
        >
            <div>
                <label><b>Nombre:</b></label>
                <input
                    type="text"
                    required
                    placeholder="NOMBRE DEL USUARIO"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    style={inputStyle}
                    disabled={loading}
                />
            </div>
            <div>
                <label><b>Apellido Paterno:</b></label>
                <input
                    type="text"
                    placeholder="APELLIDO PATERNO"
                    value={ap_pat}
                    onChange={(e) => setAp_pat(e.target.value)}
                    style={inputStyle}
                    disabled={loading}
                />
            </div>
            <div>
                <label><b>Apellido Materno:</b></label>
                <input
                    type="text"
                    placeholder="APELLIDO MATERNO"
                    value={ap_mat}
                    onChange={(e) => setAp_mat(e.target.value)}
                    style={inputStyle}
                    disabled={loading}
                />
            </div>
            <div>
                <label><b>Número de celular:</b></label>
                <input
                    type="text"
                    placeholder="NÚMERO CELULAR"
                    value={num_cel}
                    onChange={(e) => setNum_cel(e.target.value)}
                    style={inputStyle}
                    disabled={loading}
                />
            </div>
            <div>
                <label><b>Correo:</b></label>
                <input
                    type="email"
                    placeholder="CORREO"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    style={inputStyle}
                    disabled={loading}
                />
            </div>
            <div>
                <label><b>Domicilio:</b></label>
                <input
                    type="text"
                    placeholder="DOMICILIO"
                    value={domicilio}
                    onChange={(e) => setDomicilio(e.target.value)}
                    style={inputStyle}
                    disabled={loading}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        ...buttonStyle,
                        backgroundColor: '#999',
                    }}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button type="submit" style={buttonStyle} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
}

export default function Ver_usuarios() {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('Nombre');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const [rows, setRows] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
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
                if (!data.error) {
                    setRows(data);
                }
            })
            .catch((err) => console.error('Error al obtener usuarios:', err));
    }, []);

    const filteredRows = rows.filter((row) => {
        const query = searchQuery.toLowerCase();
        return (
            row.Nombre?.toLowerCase().includes(query) ||
            row.Apellido_pat?.toLowerCase().includes(query) ||
            row.Apellido_mat?.toLowerCase().includes(query) ||
            row.num_celular?.toLowerCase().includes(query) ||
            row.correo?.toLowerCase().includes(query) ||
            row.domicilio?.toLowerCase().includes(query)
        );
    });

    const visibleRows = React.useMemo(() =>
        [...filteredRows]
            .sort(getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredRows, order, orderBy, page, rowsPerPage]
    );

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.id_usuario);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [...selected];
        if (selectedIndex === -1) newSelected.push(id);
        else newSelected.splice(selectedIndex, 1);
        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const isSelected = (id) => selected.indexOf(id) !== -1;

    const handleEdit = (user) => {
        MySwal.fire({
            title: 'Editar Usuario',
            html: (
                <EditUserForm
                    user={user}
                    onSave={(updatedUser) => {
                        setRows((prev) =>
                            prev.map((row) =>
                                row.id_usuario === updatedUser.id_usuario ? updatedUser : row
                            )
                        );
                        MySwal.close();
                        Swal.fire('Guardado!', 'Usuario actualizado correctamente.', 'success');
                    }}
                    onCancel={() => MySwal.close()}
                />
            ),
            showConfirmButton: false,
            showCloseButton: true,
            width: '450px',
            allowOutsideClick: () => !MySwal.isLoading(),
        });
    };

    const handleDelete = (user) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Eliminar usuario ${user.Nombre} ${user.Apellido_pat}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch('/api/UpdateGeneral/update_generic', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            table: 'usuarios',
                            updates: { status: 0 },
                            idField: 'id_usuario',
                            idValue: user.id_usuario,
                        }),
                    });

                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || 'Error al eliminar');
                    }

                    setRows((prev) => prev.filter((row) => row.id_usuario !== user.id_usuario));
                    Swal.fire('Eliminado!', 'Usuario eliminado correctamente.', 'success');
                } catch (error) {
                    Swal.fire('Error', error.message, 'error');
                }
            }
        });
    };

    return (
        <Box sx={{ width: '95%', margin: 'auto' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <label style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Visualizar Usuarios</label>
                </div>
                <EnhancedTableToolbar numSelected={selected.length} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 16px 16px'
                }}>
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            width: '100%',
                            maxWidth: '300px'
                        }}
                    />
                </div>

                <TableContainer>
                    <Table sx={{ minWidth: 750 }} size="small">
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const isItemSelected = isSelected(row.id_usuario);
                                const labelId = `enhanced-table-checkbox-${index}`;
                                return (
                                    <TableRow
                                        hover
                                        onClick={(event) => handleClick(event, row.id_usuario)}
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.id_usuario}
                                        selected={isItemSelected}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isItemSelected}
                                                inputProps={{ 'aria-labelledby': labelId }}
                                            />
                                        </TableCell>
                                        <TableCell component="th" id={labelId} scope="row" padding="none">
                                            {row.Nombre}
                                        </TableCell>
                                        <TableCell>{row.Apellido_pat}</TableCell>
                                        <TableCell>{row.Apellido_mat}</TableCell>
                                        <TableCell>{row.num_celular}</TableCell>
                                        <TableCell>{row.correo}</TableCell>
                                        <TableCell>{row.domicilio}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                aria-label="editar"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(row);
                                                }}
                                            >
                                                <EditIcon color="primary" />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                aria-label="eliminar"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(row);
                                                }}
                                            >
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {visibleRows.length === 0 && (
                                <TableRow style={{ height: (rowsPerPage) * 1 }}>
                                    <TableCell colSpan={8} align="center">
                                        No se encontraron usuarios.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[25, 50, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
