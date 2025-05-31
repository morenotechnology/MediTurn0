"use client"
import { useState, useEffect } from "react"
import { ref, set, get, push } from "firebase/database"
import { db } from "../../utils/firebase"
import styles from "./NuevoTurnoModal.module.scss"
import { FiX } from "react-icons/fi"

const especialidades = [
  "Cardiología",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Ginecología",
  "Neurología",
  "Oftalmología",
  "Oncología",
  "Pediatría",
  "Traumatología",
]

const UpdateTurnoModal = ({ onClose, paciente, turnoActual }) => {
  const [form, setForm] = useState({
    tipoConsulta: turnoActual.tipoConsulta || "general",
    especialidad: turnoActual.especialidad || "",
    ips: turnoActual.ips || "norte",
    modalidad: turnoActual.modalidad || "presencial",
    prioridad: {
      adultoMayor: false,
      discapacidad: false,
      embarazo: false,
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [medicos, setMedicos] = useState([])

  // Cargar médicos desde Firebase
  useEffect(() => {
    const medicosRef = ref(db, "medicos")
    get(medicosRef).then((snapshot) => {
      if (snapshot.exists()) {
        setMedicos(Object.values(snapshot.val()))
      }
    })
  }, [])

  // Inicializar prioridades basadas en el turno actual
  useEffect(() => {
    if (turnoActual && turnoActual.prioridad) {
      // Convertir el valor numérico de prioridad a checkboxes
      const prioridadValue = turnoActual.prioridad || 0
      setForm((prev) => ({
        ...prev,
        prioridad: {
          adultoMayor: prioridadValue >= 1,
          discapacidad: prioridadValue >= 2 || (prioridadValue === 1 && !prev.prioridad.adultoMayor),
          embarazo:
            prioridadValue === 3 ||
            (prioridadValue === 2 && !prev.prioridad.adultoMayor && !prev.prioridad.discapacidad) ||
            (prioridadValue === 1 && !prev.prioridad.adultoMayor && !prev.prioridad.discapacidad),
        },
      }))
    }
  }, [turnoActual])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith("prioridad.")) {
      const prioridadKey = name.split(".")[1]
      setForm({
        ...form,
        prioridad: {
          ...form.prioridad,
          [prioridadKey]: checked,
        },
      })
    } else {
      setForm({
        ...form,
        [name]: value,
      })
    }
  }

  const asignarMedico = () => {
    let medicosFiltrados = []

    if (form.tipoConsulta === "general") {
      medicosFiltrados = medicos.filter((m) => m.especialidad === "general")
    } else {
      medicosFiltrados = medicos.filter((m) => m.especialidad === form.especialidad)
    }

    // Si no hay médicos disponibles para la especialidad
    if (medicosFiltrados.length === 0) {
      return null
    }

    // Ordenar por cantidad de turnos (menor a mayor)
    medicosFiltrados.sort((a, b) => a.turnos - b.turnos)

    return medicosFiltrados[0]
  }

  const calcularPrioridad = () => {
    let nivelPrioridad = 0

    if (form.prioridad.adultoMayor) nivelPrioridad += 1
    if (form.prioridad.discapacidad) nivelPrioridad += 1
    if (form.prioridad.embarazo) nivelPrioridad += 1

    return nivelPrioridad
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Si cambia el tipo de consulta o especialidad, reasignar médico
      let medicoAsignado = turnoActual.medico
      if (
        form.tipoConsulta !== turnoActual.tipoConsulta ||
        (form.tipoConsulta === "especializada" && form.especialidad !== turnoActual.especialidad)
      ) {
        // Decrementar contador del médico anterior
        if (turnoActual.medico) {
          const medicoAnteriorRef = ref(db, `medicos/${turnoActual.medico.id}`)
          const medicoAnteriorSnap = await get(medicoAnteriorRef)
          if (medicoAnteriorSnap.exists()) {
            const medicoAnterior = medicoAnteriorSnap.val()
            await set(ref(db, `medicos/${turnoActual.medico.id}/turnos`), Math.max(0, medicoAnterior.turnos - 1))
          }
        }

        // Asignar nuevo médico
        medicoAsignado = asignarMedico()

        if (!medicoAsignado) {
          setError("No hay médicos disponibles para la especialidad seleccionada")
          setLoading(false)
          return
        }

        // Incrementar contador del nuevo médico
        const medicoRef = ref(db, `medicos/${medicoAsignado.id}`)
        const medicoSnap = await get(medicoRef)
        if (medicoSnap.exists()) {
          const medico = medicoSnap.val()
          await set(ref(db, `medicos/${medicoAsignado.id}/turnos`), medico.turnos + 1)
        }
      }

      // Calcular nivel de prioridad
      const nivelPrioridad = calcularPrioridad()

      // Actualizar objeto de turno
      const turnoData = {
        ...turnoActual,
        tipoConsulta: form.tipoConsulta,
        especialidad: form.tipoConsulta === "especializada" ? form.especialidad : "General",
        medico: medicoAsignado,
        ips: form.ips,
        modalidad: form.modalidad,
        prioridad: nivelPrioridad,
        fechaActualizacion: Date.now(),
      }

      // Guardar turno actualizado en Firebase
      await set(ref(db, "turnos/" + paciente.documento), turnoData)

      // Guardar en historial de actualizaciones
      const historialRef = ref(db, `historial/${paciente.documento}`)
      const nuevoHistorialRef = push(historialRef)
      await set(nuevoHistorialRef, {
        ...turnoData,
        tipo: "actualizacion",
        fechaCreacion: Date.now(),
      })

      // Crear notificación
      const notificacionData = {
        titulo: "Turno Actualizado",
        mensaje: `Tu turno #${turnoActual.turno} ha sido actualizado correctamente`,
        leido: false,
        fecha: Date.now(),
      }

      const notificacionesRef = ref(db, `notificaciones/${paciente.documento}`)
      await push(notificacionesRef, notificacionData)

      setSuccess("Turno actualizado correctamente")
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Error actualizando turno:", err)
      setError("Error al actualizar turno. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Actualizar Turno #{turnoActual.turno}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Tipo de Consulta</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tipoConsulta"
                    value="general"
                    checked={form.tipoConsulta === "general"}
                    onChange={handleChange}
                  />
                  General
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tipoConsulta"
                    value="especializada"
                    checked={form.tipoConsulta === "especializada"}
                    onChange={handleChange}
                  />
                  Especializada
                </label>
              </div>
            </div>

            {form.tipoConsulta === "especializada" && (
              <div className={styles.formGroup}>
                <label>Especialidad</label>
                <select
                  name="especialidad"
                  value={form.especialidad}
                  onChange={handleChange}
                  required={form.tipoConsulta === "especializada"}
                  className={styles.select}
                >
                  <option value="">Seleccione especialidad</option>
                  {especialidades.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>IPS</label>
              <select name="ips" value={form.ips} onChange={handleChange} required className={styles.select}>
                <option value="norte">Sede Norte</option>
                <option value="centro">Sede Centro</option>
                <option value="sur">Sede Sur</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Modalidad</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="modalidad"
                    value="presencial"
                    checked={form.modalidad === "presencial"}
                    onChange={handleChange}
                  />
                  Presencial
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="modalidad"
                    value="telemedicina"
                    checked={form.modalidad === "telemedicina"}
                    onChange={handleChange}
                  />
                  Telemedicina
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>¿Requiere atención prioritaria?</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="prioridad.adultoMayor"
                    checked={form.prioridad.adultoMayor}
                    onChange={handleChange}
                  />
                  Adulto Mayor (60+ años)
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="prioridad.discapacidad"
                    checked={form.prioridad.discapacidad}
                    onChange={handleChange}
                  />
                  Persona con Discapacidad
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="prioridad.embarazo"
                    checked={form.prioridad.embarazo}
                    onChange={handleChange}
                  />
                  Embarazo
                </label>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading || (form.tipoConsulta === "especializada" && !form.especialidad)}
              >
                {loading ? "Procesando..." : "Actualizar Turno"}
              </button>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UpdateTurnoModal

