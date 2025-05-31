"use client"
import { useState, useEffect } from "react"
import { ref, set, get, push, onValue } from "firebase/database"
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

const NuevoTurnoModal = ({ onClose, paciente }) => {
  const [form, setForm] = useState({
    tipoConsulta: "general",
    especialidad: "",
    ips: "norte",
    modalidad: "presencial",
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

  // Cargar médicos desde Firebase o inicializarlos si no existen
  useEffect(() => {
    const medicosRef = ref(db, "medicos")

    onValue(
      medicosRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setMedicos(Object.values(snapshot.val()))
        } else {
          // Si no existen médicos, los creamos
          inicializarMedicos()
        }
      },
      { onlyOnce: true },
    )
  }, [])

  const inicializarMedicos = async () => {
    const medicosGenerales = [
      { id: "mg1", nombre: "Dr. Juan Pérez", especialidad: "general", turnos: 0 },
      { id: "mg2", nombre: "Dra. María López", especialidad: "general", turnos: 0 },
      { id: "mg3", nombre: "Dr. Carlos Rodríguez", especialidad: "general", turnos: 0 },
      { id: "mg4", nombre: "Dra. Ana Martínez", especialidad: "general", turnos: 0 },
      { id: "mg5", nombre: "Dr. Luis Sánchez", especialidad: "general", turnos: 0 },
    ]

    const medicosEspecialistas = [
      { id: "me1", nombre: "Dra. Patricia Gómez", especialidad: "Cardiología", turnos: 0 },
      { id: "me2", nombre: "Dr. Roberto Díaz", especialidad: "Dermatología", turnos: 0 },
      { id: "me3", nombre: "Dra. Sofía Vargas", especialidad: "Ginecología", turnos: 0 },
      { id: "me4", nombre: "Dr. Javier Torres", especialidad: "Neurología", turnos: 0 },
      { id: "me5", nombre: "Dra. Elena Castro", especialidad: "Traumatología", turnos: 0 },
    ]

    const todosLosMedicos = [...medicosGenerales, ...medicosEspecialistas]

    // Guardar médicos en Firebase
    const medicosRef = ref(db, "medicos")
    for (const medico of todosLosMedicos) {
      await set(ref(db, `medicos/${medico.id}`), medico)
    }

    setMedicos(todosLosMedicos)
  }

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
      // Verificar si ya tiene un turno activo
      const turnosRef = ref(db, "turnos/" + paciente.documento)
      const turnoSnap = await get(turnosRef)

      if (turnoSnap.exists()) {
        setError("Ya tienes un turno activo")
        setLoading(false)
        return
      }

      // Asignar médico
      const medicoAsignado = asignarMedico()

      if (!medicoAsignado) {
        setError("No hay médicos disponibles para la especialidad seleccionada")
        setLoading(false)
        return
      }

      // Obtener último turno según el tipo de consulta
      const tipoConsulta = form.tipoConsulta
      const tipoLetra = tipoConsulta === "general" ? "G" : "E"

      const ultimoRefTipo = ref(db, `ultimo_turno_${tipoConsulta}`)
      const ultimoSnapTipo = await get(ultimoRefTipo)
      const ultimoNumero = ultimoSnapTipo.exists() ? ultimoSnapTipo.val() : 0
      const nuevoNumero = ultimoNumero + 1

      // Formatear el número con ceros a la izquierda (01, 02, etc.)
      const numeroFormateado = nuevoNumero.toString().padStart(2, "0")
      const nuevoTurno = `${tipoLetra}${numeroFormateado}`

      // Calcular nivel de prioridad
      const nivelPrioridad = calcularPrioridad()

      // Crear objeto de turno
      const turnoData = {
        turno: nuevoTurno,
        numeroTurno: nuevoNumero, // Guardamos también el número para ordenar
        paciente: {
          nombre: paciente.nombre,
          documento: paciente.documento,
          tipoDocumento: paciente.tipoDocumento,
          celular: paciente.celular,
        },
        tipoConsulta: form.tipoConsulta,
        especialidad: form.tipoConsulta === "especializada" ? form.especialidad : "General",
        medico: medicoAsignado,
        ips: form.ips,
        modalidad: form.modalidad,
        prioridad: nivelPrioridad,
        estado: "pendiente",
        fechaCreacion: Date.now(),
        timestamp: Date.now(),
      }

      // Guardar turno en Firebase
      await set(ref(db, "turnos/" + paciente.documento), turnoData)

      // Actualizar último turno del tipo correspondiente
      await set(ultimoRefTipo, nuevoNumero)

      // Incrementar contador de turnos del médico
      await set(ref(db, `medicos/${medicoAsignado.id}/turnos`), medicoAsignado.turnos + 1)

      // Guardar en historial
      const historialRef = ref(db, `historial/${paciente.documento}`)
      const nuevoHistorialRef = push(historialRef)
      await set(nuevoHistorialRef, turnoData)

      // Crear notificación
      const notificacionData = {
        titulo: "Turno Asignado",
        mensaje: `Se te ha asignado el turno ${nuevoTurno} con ${medicoAsignado.nombre}`,
        leido: false,
        fecha: Date.now(),
      }

      const notificacionesRef = ref(db, `notificaciones/${paciente.documento}`)
      await push(notificacionesRef, notificacionData)

      setSuccess(`Turno ${nuevoTurno} asignado correctamente`)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error("Error asignando turno:", err)
      setError("Error al asignar turno. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Solicitar Nuevo Turno</h3>
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
                {loading ? "Procesando..." : "Solicitar Turno"}
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

export default NuevoTurnoModal

