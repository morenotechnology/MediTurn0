
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { get, ref } from "firebase/database"
import { db } from "../utils/firebase"
import styles from "./Login.module.scss"

const Login = () => {
  const navigate = useNavigate()
  const [cedula, setCedula] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    try {
      // Buscar en todos los pacientes
      const snapshot = await get(ref(db, "pacientes"))
      if (snapshot.exists()) {
        let found = false
        snapshot.forEach((childSnapshot) => {
          const paciente = childSnapshot.val()
          if (paciente.documento === cedula) {
            localStorage.setItem("user", JSON.stringify(paciente))
            found = true
            navigate(paciente.role === "admin" ? "/admin" : "/paciente")
          }
        })

        if (!found) {
          setError("Documento no registrado")
        }
      } else {
        setError("No hay pacientes registrados")
      }
    } catch (err) {
      console.error(err)
      setError("Error al intentar ingresar")
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.formSide}>
          <h2>Hola, bienvenido</h2>
          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="cedula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Cédula"
                required
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.primaryButton}>
              Ingresar
            </button>
          </form>

          <p className={styles.registerLink}>
            ¿No tienes cuenta? <span onClick={() => navigate("/registro")}>Regístrate</span>
          </p>
        </div>

        <div className={styles.infoSide}>
          <h3>¡Nos alegra verte!</h3>
          <p>Accede a tu cuenta y gestiona tus citas médicas fácilmente.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
