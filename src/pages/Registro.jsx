"use client"

// src/pages/Registro.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../utils/firebase"
import { ref, set, get } from "firebase/database"
import styles from "./Registro.module.scss"

const Registro = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: "",
    tipoDocumento: "cedula",
    documento: "",
    celular: "",
    departamento: "",
    ciudad: "",
  })
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const snapshot = await get(ref(db, "pacientes/" + form.documento))
      if (snapshot.exists()) {
        setError("Este documento ya está registrado.")
        return
      }

      await set(ref(db, "pacientes/" + form.documento), {
        nombre: form.nombre,
        tipoDocumento: form.tipoDocumento,
        documento: form.documento,
        celular: form.celular,
        departamento: form.departamento,
        ciudad: form.ciudad,
        role: "paciente",
      })

      localStorage.setItem(
        "user",
        JSON.stringify({
          nombre: form.nombre,
          tipoDocumento: form.tipoDocumento,
          documento: form.documento,
          celular: form.celular,
          departamento: form.departamento,
          ciudad: form.ciudad,
          role: "paciente",
        }),
      )
      navigate("/paciente")
    } catch (err) {
      console.error(err)
      setError("Error al registrarse. Intenta nuevamente.")
    }
  }

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.formSide}>
          <h2>Crear Cuenta</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombres y apellidos"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <select name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} required>
                <option value="cedula">Cédula de Ciudadanía</option>
                <option value="extranjeria">Cédula de Extranjería</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="ti">Tarjeta de Identidad</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="documento"
                value={form.documento}
                onChange={handleChange}
                placeholder="Número de documento"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="tel"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                placeholder="Número de celular"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <select name="departamento" value={form.departamento} onChange={handleChange} required>
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
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                placeholder="Ciudad"
                required
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.primaryButton}>
              Registrarse
            </button>
          </form>

          <p className={styles.loginLink}>
            ¿Ya tienes cuenta? <span onClick={() => navigate("/login")}>Inicia sesión</span>
          </p>
        </div>

        <div className={styles.infoSide}>
          <h3>Bienvenido</h3>
          <p>Crea tu cuenta para solicitar turnos de urgencias y acceder a servicios rápidos.</p>
        </div>
      </div>
    </div>
  )
}

export default Registro
