"use client"
import { useState, useEffect } from "react"
import { ref, update } from "firebase/database"
import { db } from "../../utils/firebase"
import styles from "./ProfileModal.module.scss"
import { FiX, FiSave, FiLogOut } from "react-icons/fi"

const ProfileModal = ({ onClose, onLogout }) => {
  const user = JSON.parse(localStorage.getItem("user"))
  const [form, setForm] = useState({
    celular: user?.celular || "",
    departamento: user?.departamento || "",
    ciudad: user?.ciudad || "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      // Actualizar en Firebase
      await update(ref(db, "pacientes/" + user.documento), {
        celular: form.celular,
        departamento: form.departamento,
        ciudad: form.ciudad,
      })

      // Actualizar en localStorage
      const updatedUser = { ...user, ...form }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      setSuccess("Información actualizada correctamente")
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      setError("Error al actualizar la información")
    }
  }

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  if (!user) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Mi Perfil</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.profileAvatar}>{user.nombre?.[0]?.toUpperCase() || "U"}</div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Nombres y apellidos</label>
              <input type="text" value={user.nombre} disabled />
            </div>

            <div className={styles.formGroup}>
              <label>Tipo de documento</label>
              <input
                type="text"
                value={
                  user.tipoDocumento === "cedula"
                    ? "Cédula de Ciudadanía"
                    : user.tipoDocumento === "extranjeria"
                      ? "Cédula de Extranjería"
                      : user.tipoDocumento === "pasaporte"
                        ? "Pasaporte"
                        : "Tarjeta de Identidad"
                }
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label>Número de documento</label>
              <input type="text" value={user.documento} disabled />
            </div>

            <div className={styles.formGroup}>
              <label>Celular</label>
              <input
                type="tel"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                disabled={!isEditing}
                className={isEditing ? styles.editable : ""}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Departamento</label>
              {isEditing ? (
                <select
                  name="departamento"
                  value={form.departamento}
                  onChange={handleChange}
                  className={styles.editable}
                >
                  <option value="">Seleccione departamento</option>
                  <option value="Antioquia">Antioquia</option>
                  <option value="Atlántico">Atlántico</option>
                  <option value="Bogotá D.C.">Bogotá D.C.</option>
                  <option value="Bolívar">Bolívar</option>
                  <option value="Boyacá">Boyacá</option>
                  <option value="Caldas">Caldas</option>
                  <option value="Caquetá">Caquetá</option>
                  <option value="Cauca">Cauca</option>
                  <option value="Cesar">Cesar</option>
                  <option value="Córdoba">Córdoba</option>
                  <option value="Cundinamarca">Cundinamarca</option>
                  <option value="Chocó">Chocó</option>
                  <option value="Huila">Huila</option>
                  <option value="La Guajira">La Guajira</option>
                  <option value="Magdalena">Magdalena</option>
                  <option value="Meta">Meta</option>
                  <option value="Nariño">Nariño</option>
                  <option value="Norte de Santander">Norte de Santander</option>
                  <option value="Quindío">Quindío</option>
                  <option value="Risaralda">Risaralda</option>
                  <option value="Santander">Santander</option>
                  <option value="Sucre">Sucre</option>
                  <option value="Tolima">Tolima</option>
                  <option value="Valle del Cauca">Valle del Cauca</option>
                  <option value="Arauca">Arauca</option>
                  <option value="Casanare">Casanare</option>
                  <option value="Putumayo">Putumayo</option>
                  <option value="San Andrés y Providencia">San Andrés y Providencia</option>
                  <option value="Amazonas">Amazonas</option>
                  <option value="Guainía">Guainía</option>
                  <option value="Guaviare">Guaviare</option>
                  <option value="Vaupés">Vaupés</option>
                  <option value="Vichada">Vichada</option>
                </select>
              ) : (
                <input type="text" value={form.departamento} disabled />
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                disabled={!isEditing}
                className={isEditing ? styles.editable : ""}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <div className={styles.buttonGroup}>
              {isEditing ? (
                <>
                  <button type="submit" className={styles.saveButton}>
                    <FiSave /> Guardar
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setIsEditing(false)
                      setForm({
                        celular: user.celular || "",
                        departamento: user.departamento || "",
                        ciudad: user.ciudad || "",
                      })
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button type="button" className={styles.editButton} onClick={() => setIsEditing(true)}>
                  Editar información
                </button>
              )}
              <button type="button" className={styles.logoutButton} onClick={onLogout}>
                <FiLogOut /> Cerrar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal
