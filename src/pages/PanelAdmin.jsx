"use client"

// src/pages/PanelAdmin.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./PanelAdmin.module.scss"
import { db } from "../utils/firebase"
import { ref, onValue, set, remove } from "firebase/database"

const PanelAdmin = () => {
  const navigate = useNavigate()
  const [turnoActual, setTurnoActual] = useState("")
  const [colaTurnos, setColaTurnos] = useState([])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || user.role !== "admin") {
      navigate("/")
      return
    }
    const turnoRef = ref(db, "turno_actual")
    onValue(turnoRef, (snap) => {
      if (snap.exists()) setTurnoActual(snap.val())
    })

    const turnosRef = ref(db, "turnos")
    onValue(turnosRef, (snap) => {
      if (snap.exists()) {
        const datos = Object.entries(snap.val()).map(([key, value]) => ({
          id: key,
          ...value,
        }))

        // Ordenar por número de turno (primero por tipo G/E, luego por número)
        const enCola = datos
          .filter((t) => t.turno !== turnoActual)
          .sort((a, b) => {
            // Si tienen el mismo tipo (G o E), ordenar por número
            if (a.turno[0] === b.turno[0]) {
              return a.numeroTurno - b.numeroTurno
            }
            // Si son de diferente tipo, G va antes que E
            return a.turno[0] === "G" ? -1 : 1
          })

        setColaTurnos(enCola)
      } else {
        setColaTurnos([])
      }
    })
  }, [turnoActual, navigate])

  const atenderSiguiente = async () => {
    if (colaTurnos.length === 0) return
    const siguiente = colaTurnos[0].turno
    await set(ref(db, "turno_actual"), siguiente)
  }

  const reiniciarSistema = async () => {
    await set(ref(db, "turno_actual"), "")
    await set(ref(db, "ultimo_turno_general"), 0)
    await set(ref(db, "ultimo_turno_especializada"), 0)
    await remove(ref(db, "turnos"))
    alert("Sistema reiniciado")
  }

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h2>Panel Administrativo</h2>

        <div className={styles.turnoActual}>
          <h4>Turno en Atención</h4>
          <p>{turnoActual || "—"}</p>
        </div>

        <div className={styles.cola}>
          <h4>Turnos en Espera</h4>
          {colaTurnos.length > 0 ? (
            <ul>
              {colaTurnos.map((turno, index) => (
                <li key={index}>
                  {turno.turno} - {turno.paciente.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay turnos pendientes</p>
          )}
        </div>

        <button className={styles.button} onClick={atenderSiguiente} disabled={colaTurnos.length === 0}>
          Atender Siguiente
        </button>
        <button className={styles.button} onClick={reiniciarSistema}>
          Reiniciar Sistema
        </button>
      </div>
    </div>
  )
}

export default PanelAdmin
