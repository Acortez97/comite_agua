import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, TableSortLabel, Toolbar, Typography, Paper, Checkbox,
  FormControlLabel, Switch
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
  { id: 'id_usuario', numeric: false, disablePadding: true, label: 'Nombre' },
  { id: 'num_contrato', numeric: false, disablePadding: false, label: 'Contrato' },
  { id: 'Fecha_contrato', numeric: false, disablePadding: false, label: 'Fecha de contrato' },
  { id: 'respon_comite', numeric: false, disablePadding: false, label: 'Responsable Comité' },
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
        {numSelected > 0 ? `${numSelected} seleccionado(s)` : 'Contratos'}
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
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [rows, setRows] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredRows = rows.filter((row) => {
    const query = searchQuery.toLowerCase();
    return (
      row.Contratante?.toLowerCase().includes(query) ||
      row.num_contrato?.toLowerCase().includes(query) ||
      row.Fecha_contrato?.toLowerCase().includes(query) ||
      row.respon_comite?.toLowerCase().includes(query)
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
      Contratante: row.Contratante,
      Contrato: row.num_contrato,
      'Fecha de Contrato': row.Fecha_contrato,
      'Responsable Comité': row.respon_comite,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contratos");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "contratos.xlsx");
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
        select: 'c.num_contrato, DATE_FORMAT(c.Fecha_contrato, "%Y-%m-%d %H:%i:%s") AS Fecha_contrato,c.respon_comite, CONCAT_WS(" ",u.Nombre, " ", u.Apellido_pat, " ", u.Apellido_mat) AS Contratante',
        table: 'contratos c LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario',
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

  const emptyRows = Math.max(0, (1 + page) * rowsPerPage - rows.length);

  return (
    <Box sx={{ width: '95%', margin: 'auto' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <label style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Visualizar Contratos</label>
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
                      {row.Contratante}
                    </TableCell>
                    <TableCell>{row.num_contrato}</TableCell>
                    <TableCell>
                      {row.Fecha_contrato
                        ? new Date(row.Fecha_contrato.replace(' ', 'T')).toLocaleString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour12: false
                        })
                        : ''}
                    </TableCell>
                    <TableCell>{row.respon_comite}</TableCell>
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
