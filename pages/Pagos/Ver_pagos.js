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

const headCells = [
  { id: 'id_contrato', numeric: false, disablePadding: true, label: '# Contrato' },
  { id: 'id_usuario', numeric: false, disablePadding: false, label: 'Contratante' },
  { id: 'anio_pago', numeric: false, disablePadding: false, label: 'Año Pagado' },
  { id: 'mes_pago', numeric: false, disablePadding: false, label: 'Mes en que pago' },
  { id: 'monto_pago', numeric: false, disablePadding: false, label: 'Monto Pagado' },
  { id: 'metodo_pago', numeric: false, disablePadding: false, label: 'Método de pago' },
  { id: 'observaciones', numeric: false, disablePadding: false, label: 'Observaciones' },
];

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
        {numSelected > 0 ? `${numSelected} seleccionado(s)` : 'Pagos'}
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
      row.Contratante?.toLowerCase().includes(query) ||
      row.Contrato?.toLowerCase().includes(query) ||
      row.anio_pago?.toString().toLowerCase().includes(query) ||
      row.mes_pago?.toLowerCase().includes(query) ||
      row.monto_pago?.toString().toLowerCase().includes(query) ||
      row.metodo_pago?.toLowerCase().includes(query) ||
      row.observaciones?.toLowerCase().includes(query)
    );
  });

  const visibleRows = React.useMemo(() =>
    [...filteredRows]
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, order, orderBy, page, rowsPerPage]
  );

  const exportToExcel = () => {
    const exportData = filteredRows.map((row) => ({
      'Contrato': row.Contrato,
      'Contratante': row.Contratante,
      'Año Pagado': row.anio_pago,
      'Mes Pagado': row.mes_pago,
      'Monto Pagado': row.monto_pago,
      'Método de Pago': row.metodo_pago,
      'Observaciones': row.observaciones,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'pagos.xlsx');
  };

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
    fetch('/api/Selectgeneric/SelectWithJoin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        select: 'p.anio_pago, p.mes_pago, p.monto_pago, p.metodo_pago, p.observaciones, CONCAT_WS(" ",u.Nombre, " ", u.Apellido_pat, " ", u.Apellido_mat) AS Contratante,  c.num_contrato AS Contrato',
        table: 'pagos p LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario LEFT JOIN contratos c ON p.id_contrato = c.id_contrato',
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setRows(data);
        }
      })
      .catch((err) => console.error('Error al obtener pagos:', err));
  }, []);

  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - rows.length);

  return (
    <Box sx={{ width: '95%', margin: 'auto' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <label style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Visualizar Pagos</label>
        </div>
        <EnhancedTableToolbar numSelected={selected.length} />
        <div style={{ padding: '0 16px 16px', textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
          <input
            type="text"
            placeholder="Buscar contrato..."
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
              marginLeft: '16px',
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Exportar a Excel
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
                      {row.Contrato}
                    </TableCell>
                    <TableCell>{row.Contratante}</TableCell>
                    <TableCell>{row.anio_pago}</TableCell>
                    <TableCell>{row.mes_pago}</TableCell>
                    <TableCell>{row.monto_pago}</TableCell>
                    <TableCell>{row.metodo_pago}</TableCell>
                    <TableCell>{row.observaciones}</TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={8} />
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
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Compactar"
      />
    </Box>
  );
}
