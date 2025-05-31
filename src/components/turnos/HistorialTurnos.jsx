"use client"
import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "../../utils/firebase"
import styles from "./HistorialTurnos.module.scss"
import { FiClock, FiCalendar, FiUser, FiMapPin, FiMonitor } from "react-icons/fi"

const HistorialTurnos = ({ paciente }) => {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!paciente?.documento) return

    const historialRef = ref(db, `historial/${paciente.documento}`)

    onValue(historialRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const turnos = Object.values(data).sort((a, b) => b.fechaCreacion - a.fechaCreacion)
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return <div className={styles.loading}>Cargando historial...</div>
  }

  if (historial.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No tienes historial de turnos</h3>
        <p>Cuando solicites un turno, aparecerá aquí.</p>
      </div>
    )
  }

  return (
    <div className={styles.historialContainer}>
      <h3>Historial de Turnos</h3>

      <div className={styles.turnosList}>
        {historial.map((turno, index) => (
          <div key={index} className={styles.turnoCard}>
            <div className={styles.turnoHeader}>
              <div className={styles.turnoNumero}>Turno #{turno.turno}</div>
              <div className={styles.turnoEstado} data-estado={turno.estado}>
                {turno.estado === "pendiente"
                  ? "Pendiente"
                  : turno.estado === "atendido"
                    ? "Atendido"
                    : turno.estado === "cancelado"
                      ? "Cancelado"
                      : "En proceso"}
              </div>
            </div>

            <div className={styles.turnoInfo}>
              <div className={styles.infoItem}>
                <FiCalendar />
                <span>{formatFecha(turno.fechaCreacion)}</span>
              </div>

              <div className={styles.infoItem}>
                <FiUser />
                <span>{turno.medico.nombre}</span>
              </div>

              <div className={styles.infoItem}>
                <FiClock />
                <span>
                  {turno.tipoConsulta === "especializada" ? `Especializada: ${turno.especialidad}` : "Consulta General"}
                </span>
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
        ))}
      </div>
    </div>
  )
}

export default HistorialTurnos
