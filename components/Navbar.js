"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    usuarios: false,
    contratos: false,
    pagos: false,
  });

  // Para controlar la dirección (right o left) de cada dropdown
  const [dropdownDirection, setDropdownDirection] = useState({
    usuarios: "right",
    contratos: "right",
    pagos: "right",
  });

  // Refs para cada dropdown para medir posición
  const dropdownRefs = {
    usuarios: useRef(null),
    contratos: useRef(null),
    pagos: useRef(null),
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    // Cerrar todos los dropdowns cuando abres/cierra el menú móvil
    setDropdowns({
      usuarios: false,
      contratos: false,
      pagos: false,
    });
  };

  // Función para abrir/cerrar cada dropdown individualmente
  const toggleDropdown = (name) => {
    // Cerrar los otros dropdowns, abrir/cerrar solo el seleccionado
    setDropdowns((prev) => {
      const newState = {
        usuarios: false,
        contratos: false,
        pagos: false,
      };
      newState[name] = !prev[name];
      return newState;
    });
  };

  // Efecto para detectar clic fuera y cerrar dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      // Verificar si el click está fuera de cualquier dropdown abierto
      const isOutside = !Object.values(dropdownRefs).some(
        (ref) => ref.current && ref.current.contains(event.target)
      );

      if (isOutside) {
        setDropdowns({
          usuarios: false,
          contratos: false,
          pagos: false,
        });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Efecto para calcular la dirección (left/right) cuando un dropdown se abre
  useEffect(() => {
    Object.entries(dropdowns).forEach(([name, isOpen]) => {
      if (isOpen) {
        const ref = dropdownRefs[name].current;
        if (!ref) return;

        const rect = ref.getBoundingClientRect();
        const dropdownWidth = 160; // igual al min-width en CSS para dropdown-content
        const spaceRight = window.innerWidth - rect.right;

        setDropdownDirection((prev) => ({
          ...prev,
          [name]: spaceRight < dropdownWidth ? "left" : "right",
        }));
      }
    });
  }, [dropdowns]);

  const closeAll = () => {
    setMenuOpen(false);
    setDropdowns({
      usuarios: false,
      contratos: false,
      pagos: false,
    });
  };

  return (
    <nav className="navbar">
      <div className="logo">Comité del Agua de San Gaspar</div>

      <button className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
        <Link href="/" onClick={closeAll}>
          Inicio
        </Link>

        {/* Usuarios */}
        <div className="dropdown" ref={dropdownRefs.usuarios}>
          <button
            className="dropbtn"
            onClick={() => toggleDropdown("usuarios")}
          >
            Usuarios ▾
          </button>
          {dropdowns.usuarios && (
            <div
              className={`dropdown-content ${
                dropdownDirection.usuarios === "left" ? "left" : ""
              }`}
            >
              <Link href="/Ver_usuarios" onClick={closeAll}>
                Ver Usuarios
              </Link>
              <Link href="/Registro_usuarios" onClick={closeAll}>
                Registrar Usuarios
              </Link>
              <Link href="/Editar_usuarios" onClick={closeAll}>
                Editar Usuarios
              </Link>
            </div>
          )}
        </div>

        {/* Contratos */}
        <div className="dropdown" ref={dropdownRefs.contratos}>
          <button
            className="dropbtn"
            onClick={() => toggleDropdown("contratos")}
          >
            Contratos ▾
          </button>
          {dropdowns.contratos && (
            <div
              className={`dropdown-content ${
                dropdownDirection.contratos === "left" ? "left" : ""
              }`}
            >
              <Link href="/Ver_contratos" onClick={closeAll}>
                Ver Contratos
              </Link>
              <Link href="/Registro_contratos" onClick={closeAll}>
                Registrar Contratos
              </Link>
              <Link href="/Editar_contratos" onClick={closeAll}>
                Editar Contratos
              </Link>
            </div>
          )}
        </div>

        {/* Pagos */}
        <div className="dropdown" ref={dropdownRefs.pagos}>
          <button className="dropbtn" onClick={() => toggleDropdown("pagos")}>
            Pagos ▾
          </button>
          {dropdowns.pagos && (
            <div
              className={`dropdown-content ${
                dropdownDirection.pagos === "left" ? "left" : ""
              }`}
            >
              <Link href="/Ver_pagos" onClick={closeAll}>
                Ver Pagos
              </Link>
              <Link href="/Registro_pagos" onClick={closeAll}>
                Registrar Pagos
              </Link>
              <Link href="/Editar_pagos" onClick={closeAll}>
                Registrar Aportaciones extras
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
