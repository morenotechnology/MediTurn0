"use client"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiSearch, FiBookmark } from "react-icons/fi"
import styles from "./Menu.module.scss"
import ProfileModal from "./ProfileModal"
import Notificaciones from "./Notificaciones"
import HistorialDropdown from "./HistorialDropdown"

const Menu = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [showProfile, setShowProfile] = useState(false)
  const [showHistorial, setShowHistorial] = useState(false)

  const logout = () => {
    setShowProfile(false) // Cerrar el modal de perfil
    localStorage.removeItem("user")
    navigate("/login")
  }

  const handleClickOutside = (e) => {
    if (!e.target.closest(`.${styles.historialContainer}`)) {
      setShowHistorial(false)
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  return (
    <header className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logoIcon}>●●</span> MediTurn
        </Link>

        <div className={styles.navIcons}>
          {user ? (
            <>
              <FiSearch className={styles.icon} />
              <div
                className={`${styles.icon} ${styles.historialContainer}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowHistorial(!showHistorial)
                }}
              >
                <FiBookmark />
                {showHistorial && <HistorialDropdown paciente={user} />}
              </div>
              <Notificaciones paciente={user} variant="icon" />
              <div className={styles.avatar} onClick={() => setShowProfile(true)}>
                {user.nombre?.[0]?.toUpperCase() || "U"}
              </div>
              {showProfile && <ProfileModal onClose={() => setShowProfile(false)} onLogout={logout} />}
            </>
          ) : (
            <>
              <Link to="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link to="/registro" className={styles.loginButton}>
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Menu


