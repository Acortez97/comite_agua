/*import React, { useEffect, useState } from 'react';
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
}*/


import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, TableSortLabel, Toolbar, Typography, Paper, Checkbox, IconButton,
  Tooltip, FormControlLabel, Switch
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const headCells = [
  { id: 'Nombre', numeric: false, disablePadding: true, label: 'Nombre' },
  { id: 'Apellido_pat', numeric: false, disablePadding: false, label: 'Apellido Paterno' },
  { id: 'Apellido_mat', numeric: false, disablePadding: false, label: 'Apellido Materno' },
  { id: 'num_celular', numeric: false, disablePadding: false, label: 'Celular' },
  { id: 'correo', numeric: false, disablePadding: false, label: 'Correo' },
  { id: 'domicilio', numeric: false, disablePadding: false, label: 'Domicilio' },
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

export default function Ver_usuarios() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('Nombre');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');

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
  const handleChangeDense = (event) => setDense(event.target.checked);
  const isSelected = (id) => selected.indexOf(id) !== -1;

  React.useEffect(() => {
    fetch('/api/Selectgeneric/Select_Gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        select: '*',
        table: 'usuarios',
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setRows(data);
        }
      })
      .catch((err) => console.error('Error al obtener usuarios:', err));
  }, []);

  const exportToExcel = () => {
    const exportData = filteredRows.map(row => ({
      Nombre: row.Nombre,
      Apellido_Paterno: row.Apellido_pat,
      Apellido_Materno: row.Apellido_mat,
      Celular: row.num_celular,
      Correo: row.correo,
      Domicilio: row.domicilio,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(dataBlob, "usuarios.xlsx");
  };

  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - rows.length);

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

          <button
            onClick={exportToExcel}
            style={{
              marginLeft: '10px',
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Descargar Excel
          </button>
        </div>

        <TableContainer>
          <Table sx={{ minWidth: 750 }} size={dense ? 'small' : 'medium'}>
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
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Compactar"
      />
    </Box>
  );
}
