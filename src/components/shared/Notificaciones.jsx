"use client"
import { useState, useEffect } from "react"
import { ref, onValue, update, push } from "firebase/database"
import { db } from "../../utils/firebase"
import styles from "./Notificaciones.module.scss"
import { FiBell, FiCheck } from "react-icons/fi"

const Notificaciones = ({ paciente, variant = "icon" }) => {
  const [notificaciones, setNotificaciones] = useState([])
  const [showNotificaciones, setShowNotificaciones] = useState(false)
  const [noLeidas, setNoLeidas] = useState(0)

  useEffect(() => {
    if (!paciente?.documento) return

    const notificacionesRef = ref(db, `notificaciones/${paciente.documento}`)

    onValue(notificacionesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const notificacionesArray = Object.entries(data)
          .map(([id, notif]) => ({
            id,
            ...notif,
          }))
          .sort((a, b) => b.fecha - a.fecha)

        setNotificaciones(notificacionesArray)
        setNoLeidas(notificacionesArray.filter((n) => !n.leido).length)
      } else {
        setNotificaciones([])
        setNoLeidas(0)
      }
    })
  }, [paciente])

  const marcarComoLeida = async (id) => {
    if (!paciente?.documento) return

    await update(ref(db, `notificaciones/${paciente.documento}/${id}`), {
      leido: true,
    })
  }

  const marcarTodasComoLeidas = async () => {
    if (!paciente?.documento || notificaciones.length === 0) return

    const updates = {}
    notificaciones.forEach((notif) => {
      if (!notif.leido) {
        updates[`notificaciones/${paciente.documento}/${notif.id}/leido`] = true
      }
    })

    await update(ref(db), updates)
  }

  const formatFecha = (timestamp) => {
    const fecha = new Date(timestamp)
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Función para crear una notificación de prueba (solo para desarrollo)
  const crearNotificacionPrueba = async () => {
    if (!paciente?.documento) return

    const notificacionData = {
      titulo: "Notificación de prueba",
      mensaje: "Esta es una notificación de prueba creada el " + new Date().toLocaleString(),
      leido: false,
      fecha: Date.now(),
    }

    const notificacionesRef = ref(db, `notificaciones/${paciente.documento}`)
    await push(notificacionesRef, notificacionData)
  }

  // Renderizado condicional basado en la variante
  if (variant === "icon") {
    return (
      <div className={styles.notificacionesContainer}>
        <div className={styles.notificacionesIcon} onClick={() => setShowNotificaciones(!showNotificaciones)}>
          <FiBell />
          {noLeidas > 0 && <span className={styles.badge}>{noLeidas}</span>}
        </div>

        {showNotificaciones && (
          <div className={styles.notificacionesPanel}>
            <div className={styles.notificacionesHeader}>
              <h3>Notificaciones</h3>
              {noLeidas > 0 && (
                <button className={styles.marcarLeidas} onClick={marcarTodasComoLeidas}>
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <div className={styles.notificacionesList}>
              {notificaciones.length > 0 ? (
                notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    className={`${styles.notificacionItem} ${!notif.leido ? styles.noLeida : ""}`}
                    onClick={() => !notif.leido && marcarComoLeida(notif.id)}
                  >
                    <div className={styles.notificacionContent}>
                      <h4>{notif.titulo}</h4>
                      <p>{notif.mensaje}</p>
                      <span className={styles.fecha}>{formatFecha(notif.fecha)}</span>
                    </div>
                    {!notif.leido && (
                      <div className={styles.marcarLeida}>
                        <FiCheck />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No tienes notificaciones</div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Variante para panel completo
  return (
    <div className={styles.panelContainer}>
      <div className={styles.panelHeader}>
        <h3>Notificaciones</h3>
        <div className={styles.panelActions}>
          {noLeidas > 0 && (
            <button className={styles.marcarLeidas} onClick={marcarTodasComoLeidas}>
              Marcar todas como leídas
            </button>
          )}
          {/* Solo para desarrollo */}
          {/* <button className={styles.testButton} onClick={crearNotificacionPrueba}>
            Crear notificación de prueba
          </button> */}
        </div>
      </div>

      <div className={styles.panelContent}>
        {notificaciones.length > 0 ? (
          notificaciones.map((notif) => (
            <div
              key={notif.id}
              className={`${styles.notificacionItem} ${!notif.leido ? styles.noLeida : ""}`}
              onClick={() => !notif.leido && marcarComoLeida(notif.id)}
            >
              <div className={styles.notificacionContent}>
                <h4>{notif.titulo}</h4>
                <p>{notif.mensaje}</p>
                <span className={styles.fecha}>{formatFecha(notif.fecha)}</span>
              </div>
              {!notif.leido && (
                <div className={styles.marcarLeida}>
                  <FiCheck />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No tienes notificaciones</div>
        )}
      </div>
    </div>
  )
}

export default Notificaciones
 