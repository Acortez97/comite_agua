"use client";
import Link from "next/link";
import { useState, useRef, useEffect, useContext } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { AuthContext } from "../context/authContext";

export default function Navbar() {
  const { user, logout, loading  } = useContext(AuthContext);
    //if (!user) return null; // No mostrar Nav si no hay sesión

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    usuarios: false,
    contratos: false,
    pagos: false,
  });

  const [dropdownDirection, setDropdownDirection] = useState({
    usuarios: "right",
    contratos: "right",
    pagos: "right",
  });

  const dropdownRefs = {
    usuarios: useRef(null),
    contratos: useRef(null),
    pagos: useRef(null),
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    setDropdowns({
      usuarios: false,
      contratos: false,
      pagos: false,
    });
  };

  const toggleDropdown = (name) => {
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

  useEffect(() => {
    function handleClickOutside(event) {
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

  useEffect(() => {
    Object.entries(dropdowns).forEach(([name, isOpen]) => {
      if (isOpen) {
        const ref = dropdownRefs[name].current;
        if (!ref) return;

        const rect = ref.getBoundingClientRect();
        const dropdownWidth = 160;
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

  const handleLogout = () => {
    logout();
    closeAll();
    window.location.href = "/login";
  };
  if (loading) {
    // Opcional: mostrar spinner o nav mínimo mientras carga
    return (
      <nav className="navbar">
        <div className="logo">Comité del Agua de San Gaspar</div>
        <p>Cargando...</p>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="logo">Comité del Agua de San Gaspar</div>

      <button className="hamburger" onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {user ? (
        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <Link href="/" onClick={closeAll}>
            Inicio
          </Link>

          {/* USUARIOS */}
          {(user.rol === "admin" || user.rol === "user") && (
            <div className="dropdown" ref={dropdownRefs.usuarios}>
              <button className="dropbtn" onClick={() => toggleDropdown("usuarios")}>
                Usuarios ▾
              </button>
              {dropdowns.usuarios && (
                <div
                  className={`dropdown-content ${
                    dropdownDirection.usuarios === "left" ? "left" : ""
                  }`}
                >
                  <Link href="/Usuarios/Ver_usuarios" onClick={closeAll}>
                    Ver Usuarios
                  </Link>
                  {user.rol === "admin" && (
                    <>
                    <Link href="/Usuarios/ver_userAdmin" onClick={closeAll}>
                        Administrar Usuarios
                      </Link>
                      <Link href="/Usuarios/Registro_usuarios" onClick={closeAll}>
                        Registrar Usuarios
                      </Link>
                      <Link href="/admin/Registro_users" onClick={closeAll}>
                        Roles
                      </Link>
                       <Link href="/admin/Cambio_pass" onClick={closeAll}>
                        actualizar Contrasela
                      </Link>
                     {/**<Link href="/Usuarios/Editar_usuarios" onClick={closeAll}>
                        Editar Usuarios
                      </Link> */} 
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CONTRATOS */}
          {(user.rol === "admin" || user.rol === "user") && (
            <div className="dropdown" ref={dropdownRefs.contratos}>
              <button className="dropbtn" onClick={() => toggleDropdown("contratos")}>
                Contratos ▾
              </button>
              {dropdowns.contratos && (
                <div
                  className={`dropdown-content ${
                    dropdownDirection.contratos === "left" ? "left" : ""
                  }`}
                >
                  <Link href="/Contratos/Ver_contratos" onClick={closeAll}>
                    Ver Contratos
                  </Link>
                  {user.rol === "admin" && (
                    <>
                      <Link href="/Contratos/Registro_contratos" onClick={closeAll}>
                        Registrar Contratos
                      </Link>
                     {/*} <Link href="/Contratos/Editar_contratos" onClick={closeAll}>
                        Editar Contratos
                      </Link>*/}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PAGOS */}
          {(user.rol === "admin" || user.rol === "user") && (
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
                  <Link href="/Pagos/Ver_pagos" onClick={closeAll}>
                    Ver Pagos
                  </Link>
                  <Link href="/Pagos/Ver_aportaciones" onClick={closeAll}>
                        Ver Aportaciones Voluntarias
                      </Link>
                      <Link href="/Pagos/Ver_salidas" onClick={closeAll}>
                        Ver Salidas
                      </Link>
                  {user.rol === "admin" && (
                    <>
                      <Link href="/Pagos/Registro_pagos" onClick={closeAll}>
                        Registrar Pagos
                      </Link>
                      <Link href="/Pagos/Registro_Avoluntarias" onClick={closeAll}>
                        Registrar Aportaciones extras
                      </Link>
                      <Link href="/Pagos/Registro_Salidas" onClick={closeAll}>
                        Registrar Salidas
                      </Link>
                      
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CERRAR SESIÓN */}
          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{
              marginLeft: "20px",
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      ) :(
    
        <p style={{ fontStyle: 'italic' }}>Inicia sesión para ver más opciones</p>
      )}
    </nav>
  );
}
