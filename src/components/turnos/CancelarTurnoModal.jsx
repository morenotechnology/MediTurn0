"use client"
import { useState } from "react"
import { ref, remove, set, push } from "firebase/database"
import { db } from "../../utils/firebase"
import styles from "./NuevoTurnoModal.module.scss"
import { FiX } from "react-icons/fi"

const CancelarTurnoModal = ({ onClose, paciente, turnoActual }) => {
  const [motivo, setMotivo] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Guardar en historial antes de eliminar
      const historialRef = ref(db, `historial/${paciente.documento}`)
      const nuevoHistorialRef = push(historialRef)
      await set(nuevoHistorialRef, {
        ...turnoActual,
        estado: "cancelado",
        motivoCancelacion: motivo,
        fechaCancelacion: Date.now(),
        tipo: "cancelacion",
      })

      // Decrementar contador del médico
      if (turnoActual.medico) {
        const medicoRef = ref(db, `medicos/${turnoActual.medico.id}/turnos`)
        const turnosActuales = turnoActual.medico.turnos || 0
        await set(medicoRef, Math.max(0, turnosActuales - 1))
      }

      // Eliminar turno
      await remove(ref(db, "turnos/" + paciente.documento))

      // Crear notificación
      const notificacionData = {
        titulo: "Turno Cancelado",
        mensaje: `Tu turno #${turnoActual.turno} ha sido cancelado`,
        leido: false,
        fecha: Date.now(),
      }

      const notificacionesRef = ref(db, `notificaciones/${paciente.documento}`)
      await push(notificacionesRef, notificacionData)

      setSuccess("Turno cancelado correctamente")
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Error cancelando turno:", err)
      setError("Error al cancelar turno. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Cancelar Turno #{turnoActual.turno}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.confirmationText}>
            ¿Estás seguro que deseas cancelar tu turno? Esta acción no se puede deshacer.
          </p>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Motivo de cancelación</label>
              <textarea
                name="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Indica el motivo de la cancelación"
                className={styles.textarea}
                required
              ></textarea>
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <div className={styles.buttonGroup}>
              <button type="submit" className={`${styles.submitButton} ${styles.dangerButton}`} disabled={loading}>
                {loading ? "Procesando..." : "Confirmar Cancelación"}
              </button>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Volver
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CancelarTurnoModal
