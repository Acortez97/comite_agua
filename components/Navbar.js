"use client";
import Link from 'next/link';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    setDropdownOpen(false);
  };

  const closeAll = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="logo">Comité del Agua de San Gaspar</div>
      <button className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
      <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/" onClick={closeAll}>Inicio</Link>
        <div className="dropdown">
          <button
            className="dropbtn"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            Usuarios ▾
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              <Link href="/Ver_usuarios" onClick={closeAll}>Ver Usuarios</Link>
              <Link href="/Registro_usuarios" onClick={closeAll}>Registrar Usuarios</Link>
              <Link href="/Editar_usuarios" onClick={closeAll}>Editar Usuarios</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
