"use client"
import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "../../utils/firebase"
import styles from "./HistorialDropdown.module.scss"
import { FiCalendar, FiUser, FiMapPin, FiMonitor } from "react-icons/fi"

const HistorialDropdown = ({ paciente }) => {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!paciente?.documento) return

    const historialRef = ref(db, `historial/${paciente.documento}`)

    onValue(historialRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const turnos = Object.values(data)
          .sort((a, b) => b.fechaCreacion - a.fechaCreacion)
          .slice(0, 5) // Mostrar solo los 5 más recientes
        setHistorial(turnos)
      } else {
        setHistorial([])
      }
      setLoading(false)
    })
  }, [paciente])

  const formatFecha = (timestamp) => {
    const fecha = new Date(timestamp)
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <h3>Historial de Turnos</h3>
        <button className={styles.verTodos} onClick={() => (window.location.href = "/paciente?historial=true")}>
          Ver todos
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : historial.length > 0 ? (
          historial.map((turno, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.turnoHeader}>
                <div className={styles.turnoNumero}>Turno #{turno.turno}</div>
                <div className={styles.turnoEstado} data-estado={turno.estado || "pendiente"}>
                  {turno.estado === "atendido"
                    ? "Atendido"
                    : turno.estado === "cancelado"
                      ? "Cancelado"
                      : turno.estado === "en_proceso"
                        ? "En proceso"
                        : "Pendiente"}
                </div>
              </div>

              <div className={styles.turnoInfo}>
                <div className={styles.infoItem}>
                  <FiCalendar />
                  <span>{formatFecha(turno.fechaCreacion)}</span>
                </div>

                <div className={styles.infoItem}>
                  <FiUser />
                  <span>{turno.medico?.nombre || "Sin asignar"}</span>
                </div>

                <div className={styles.infoItem}>
                  <FiMapPin />
                  <span>IPS {turno.ips === "norte" ? "Norte" : turno.ips === "centro" ? "Centro" : "Sur"}</span>
                </div>

                <div className={styles.infoItem}>
                  <FiMonitor />
                  <span>{turno.modalidad === "presencial" ? "Presencial" : "Telemedicina"}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No tienes historial de turnos</div>
        )}
      </div>
    </div>
  )
}

export default HistorialDropdown


