"use client"

// src/pages/index/Index.jsx
import { useEffect, useState } from "react"
import { onValue, ref } from "firebase/database"
import { db } from "../../utils/firebase"
import styles from "./Index.module.scss"
import { FaUser } from "react-icons/fa"

const Index = () => {
  const [turnoActual, setTurnoActual] = useState("")
  const [tiempoRestante, setTiempoRestante] = useState(120)

  useEffect(() => {
    const turnoRef = ref(db, "turno_actual")
    onValue(turnoRef, (snap) => {
      if (snap.exists()) {
        setTurnoActual(snap.val())
        setTiempoRestante(120) // reset tiempo cada vez que cambia de turno
      }
    })

    const interval = setInterval(() => {
      setTiempoRestante((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.hero}>
      <div className={styles.highlight}>Atención rápida de urgencias sin filas ni papeleo.</div>
      <h1 className={styles.title}>
        Gestiona tus turnos médicos <br /> de urgencias en segundos
      </h1>
      <p className={styles.description}>
        Regístrate, inicia sesión y solicita tu turno desde cualquier lugar. Nuestra plataforma te permite ver tu turno
        en tiempo real y ser atendido sin demoras.
      </p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <FaUser className={styles.icon} />
          <div>
            <p className={styles.cardLabel}>Turno actual</p>
            <h3>{turnoActual || "—"}</h3>
          </div>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressInner} style={{ width: `${(tiempoRestante / 120) * 100}%` }} />
      </div>
    </div>
  )
}

export default Index


