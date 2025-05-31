"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import styles from "./TurnosPaciente.module.scss"
import { FaPlusCircle, FaEdit, FaTimes } from "react-icons/fa"
import { db } from "../utils/firebase"
import { ref, onValue } from "firebase/database"
import NuevoTurnoModal from "../components/turnos/NuevoTurnoModal"
import UpdateTurnoModal from "../components/turnos/UpdateTurnoModal"
import CancelarTurnoModal from "../components/turnos/CancelarTurnoModal"
import HistorialTurnos from "../components/turnos/HistorialTurnos"
import Notificaciones from "../components/shared/Notificaciones"

const TurnosPaciente = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const showHistorialParam = queryParams.get("historial") === "true"

  const [paciente, setPaciente] = useState(null)
  const [miTurno, setMiTurno] = useState(null)
  const [turnoActual, setTurnoActual] = useState("")
  const [tiempoRestante, setTiempoRestante] = useState(120)
  const [showNuevoTurno, setShowNuevoTurno] = useState(false)
  const [showUpdateTurno, setShowUpdateTurno] = useState(false)
  const [showCancelarTurno, setShowCancelarTurno] = useState(false)
  const [showHistorial, setShowHistorial] = useState(showHistorialParam)
  const [showNotificaciones, setShowNotificaciones] = useState(false)

  const tiempoPorTurno = 2 // minutos

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user) {
      navigate("/login")
      return
    }

    setPaciente(user)

    const turnoRef = ref(db, "turno_actual")
    onValue(turnoRef, (snapshot) => {
      const val = snapshot.val()
      if (val !== null) setTurnoActual(val)
    })

    if (user?.documento) {
      const miTurnoRef = ref(db, "turnos/" + user.documento)
      onValue(miTurnoRef, (snapshot) => {
        const val = snapshot.val()
        if (val) {
          setMiTurno(val)
        } else {
          setMiTurno(null)
        }
      })
    }
  }, [navigate])

  useEffect(() => {
    setShowHistorial(showHistorialParam)
  }, [showHistorialParam])

  useEffect(() => {
    const turnoRef = ref(db, "turno_actual")
    onValue(turnoRef, (snap) => {
      if (snap.exists()) {
        setTurnoActual(snap.val())
        setTiempoRestante(120)
      }
    })

    const interval = setInterval(() => {
      setTiempoRestante((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Calcular tiempo de espera basado en posición en la cola
  const calcularTiempoEspera = () => {
    if (!miTurno || !turnoActual) return 0

    // Si es el turno actual
    if (miTurno.turno === turnoActual) return 0

    // Si son del mismo tipo (G o E)
    if (miTurno.turno[0] === turnoActual[0]) {
      const miNumero = miTurno.numeroTurno
      const actualNumero = Number.parseInt(turnoActual.substring(1))
      return (miNumero - actualNumero) * tiempoPorTurno
    }

    // Si son de diferente tipo, estimamos basado en el número
    return miTurno.numeroTurno * tiempoPorTurno
  }

  const tiempoEspera = calcularTiempoEspera()

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h2>Panel de Turnos</h2>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <p>TURNO ACTUAL</p>
          <span>{turnoActual || "—"}</span>
        </div>
        <div className={styles.stat}>
          <p>MI TURNO</p>
          <span>{miTurno ? miTurno.turno : "--"}</span>
        </div>
        <div className={styles.stat}>
          <p>TIEMPO ESTIMADO</p>
          <span>{miTurno ? `${tiempoEspera} min` : "--"}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.nuevo} onClick={() => setShowNuevoTurno(true)} disabled={miTurno}>
          <FaPlusCircle /> {miTurno ? "Ya tienes turno" : "Nuevo Turno"}
        </button>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressInner} style={{ width: `${(tiempoRestante / 120) * 100}%` }} />
      </div>

      {miTurno && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Turno Actual</h3>
            <div className={styles.turnoEstado} data-estado={miTurno.estado || "pendiente"}>
              {miTurno.estado === "atendido"
                ? "Atendido"
                : miTurno.estado === "cancelado"
                  ? "Cancelado"
                  : miTurno.estado === "en_proceso"
                    ? "En proceso"
                    : "Pendiente"}
            </div>
          </div>

          <div className={styles.cardInfo}>
            <div>
              <h3>Turno {miTurno.turno}</h3>
              <p>
                <strong>Tipo:</strong>{" "}
                {miTurno.tipoConsulta === "especializada"
                  ? `Especializada - ${miTurno.especialidad}`
                  : "Consulta General"}
              </p>
              <p>
                <strong>Médico:</strong> {miTurno.medico?.nombre || "Sin asignar"}
              </p>
              <p>
                <strong>IPS:</strong>{" "}
                {miTurno.ips === "norte" ? "Sede Norte" : miTurno.ips === "centro" ? "Sede Centro" : "Sede Sur"}
              </p>
              <p>
                <strong>Modalidad:</strong> {miTurno.modalidad === "presencial" ? "Presencial" : "Telemedicina"}
              </p>
            </div>
            <div className={styles.timeBox}>{tiempoEspera > 0 ? `${tiempoEspera} min` : "En atención"}</div>
          </div>

          <div className={styles.cardActions}>
            <button className={styles.editButton} onClick={() => setShowUpdateTurno(true)}>
              <FaEdit /> Actualizar
            </button>
            <button className={styles.cancelButton} onClick={() => setShowCancelarTurno(true)}>
              <FaTimes /> Cancelar
            </button>
          </div>
        </div>
      )}

      {showNotificaciones && paciente && (
        <div className={styles.notificacionesPanel}>
          <Notificaciones paciente={paciente} variant="panel" />
        </div>
      )}

      {showHistorial && paciente && <HistorialTurnos paciente={paciente} />}

      {showNuevoTurno && <NuevoTurnoModal onClose={() => setShowNuevoTurno(false)} paciente={paciente} />}

      {showUpdateTurno && miTurno && (
        <UpdateTurnoModal onClose={() => setShowUpdateTurno(false)} paciente={paciente} turnoActual={miTurno} />
      )}

      {showCancelarTurno && miTurno && (
        <CancelarTurnoModal onClose={() => setShowCancelarTurno(false)} paciente={paciente} turnoActual={miTurno} />
      )}
    </div>
  )
}

export default TurnosPaciente
