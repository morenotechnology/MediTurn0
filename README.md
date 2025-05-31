Proyecto Final Estructuas de datos 2

Integrantes: 
Samuel Moreno 2226016
David Velasco 2225676
Kelvin Martinez 2185430

Figma: https://www.figma.com/proto/bbnbfaF3KNZZPXc2KuyeT8/Dashboard-Login--Community-?node-id=0-1&t=PZLJr5GGGDFQeP6t-1
Repositorio: https://github.com/morenotechnology/MediTurn0/
Despliegue: https://mitienda.cfd/

Antes de desplejar el programa, debes de instalar los siguiente en tu entorno de trabajo:
npm install firebase
npm install react-router-dom
npm install react-icons
npm install sass

# Manual de Usuario - MediTurn

## Descripción General
MediTurn es una plataforma web para la gestión de turnos médicos de urgencias en tiempo real. Permite a los pacientes solicitar turnos y al personal administrativo gestionar la atención de manera eficiente.

## Tipos de Usuario
### 1. **Pacientes**
- Pueden registrarse en la plataforma
- Solicitar turnos médicos
- Ver el estado de sus turnos en tiempo real
- Actualizar o cancelar turnos

### 2. **Administrador**
- Gestiona todos los turnos del sistema
- Atiende pacientes en orden
- Puede reiniciar el sistema
- **ID del administrador:** `1109116805`

## Cómo Empezar

### Para Pacientes Nuevos:

1. **Acceder a la plataforma**
-Ir a la página principal de MediTurn
-Hacer clic en "Registro"

2. **Crear cuenta**
Completar el formulario con:
  -Nombres y apellidos completos
  -Tipo de documento (Cédula, Cédula de Extranjería, Pasaporte, TI)
  -Número de documento
  -Número de celular
  -Departamento y ciudad
Hacer clic en "Registrarse"

3. **Acceso automático**
-Después del registro, serás redirigido automáticamente al panel de turnos

### **Para Usuarios Existentes:**
1. **Iniciar sesión**
-Hacer clic en "Login"
-Ingresar número de documento
-Hacer clic en "Ingresar"

## Funcionalidades para Pacientes

### **Solicitar un Nuevo Turno**

1. **Acceder al panel de turnos**
-Una vez logueado, verás el "Panel de Turnos"

2. **Crear nuevo turno**
-Hacer clic en "Nuevo Turno"
-Seleccionar tipo de consulta:
  -General: Medicina general
  -Especializada: Elegir especialidad específica

3. **Configurar el turno**
-Especialidad (si es consulta especializada):
  -Cardiología, Dermatología, Endocrinología, etc.
-IPS: Sede Norte, Centro o Sur
-Modalidad: Presencial o Telemedicina
-Prioridad (opcional):
  -Adulto Mayor (60+ años)
  -Persona con Discapacidad
  -Embarazo

4. **Confirmar solicitud**
-El sistema asignará automáticamente:
  -Número de turno (G01, G02... para general / E01, E02... para especializada)
  -Médico disponible
-Recibirás una notificación de confirmación

### **Gestionar Turnos Existentes**

#### **Ver Estado del Turno**
-En el panel principal verás:
  -Turno Actual: El que se está atendiendo
  -Mi Turno: Tu número asignado
  -Tiempo Estimado: Minutos aproximados de espera

#### **Actualizar Turno**
- Hacer clic en "Actualizar" en tu turno activo
- Modificar: tipo de consulta, especialidad, IPS, modalidad o prioridad
- El sistema puede reasignar médico si es necesario

#### **Cancelar Turno**
- Hacer clic en "Cancelar" en tu turno activo
- Indicar motivo de cancelación
- Confirmar la acción (irreversible)

### **Historial y Notificaciones**

#### **Ver Historial**
- En el menú superior, hacer clic en el ícono de historial
- O acceder desde el enlace "Ver todos" en el dropdown
- Muestra todos los turnos anteriores con su estado
  
#### **Notificaciones**
-Ícono de campana (🔔) en el menú superior
-Muestra notificaciones de:
  -Turnos asignados
  -Turnos actualizados
  -Turnos cancelados
-Marcar como leídas individualmente o todas a la vez

### **Perfil de Usuario**
- Hacer clic en el avatar (círculo con inicial del nombre)
- Editar información personal:
  -Celular, departamento, ciudad
- Cerrar sesión

## 👨‍💼 Funcionalidades del Administrador

### **Acceso Administrativo**
- Iniciar sesión con el documento: `1109116805`
- Acceso automático al "Panel Administrativo"

### **Gestión de Turnos**

#### **Panel de Control**
- **Turno en Atención:** Muestra el turno que se está atendiendo actualmente
- **Turnos en Espera:** Lista de todos los turnos pendientes ordenados por prioridad

#### **Atender Pacientes**
- Hacer clic en "Atender Siguiente"
- El sistema automáticamente:
  -Pasa al siguiente turno en la cola
  -Actualiza el turno actual en tiempo real
  -Notifica a todos los usuarios conectados

#### **Reiniciar Sistema**
- Hacer clic en "Reiniciar Sistema"
- **⚠️ PRECAUCIÓN:** Esta acción:
  -Elimina todos los turnos activos
  -Reinicia los contadores de turnos
  -Borra el turno actual
  -Es irreversible
  
## Flujo del Sistema

### **Orden de Atención**

1. **Prioridad por tipo:**
-Turnos Generales (G) tienen prioridad sobre Especializados (E)

2. **Dentro del mismo tipo:**
-Se atienden por orden de llegada (G01, G02, G03...)

3. **Factores de prioridad:**
-Adultos mayores
-Personas con discapacidad
-Embarazadas

### **Asignación de Médicos**
- El sistema asigna automáticamente el médico con menos turnos asignados
- Para consultas generales: médicos generales
- Para especialidades: médicos de la especialidad específica

### **Tiempo Real**
- Todos los cambios se reflejan inmediatamente en todos los dispositivos conectados
- Los pacientes ven actualizaciones en vivo del turno actual
- Estimación de tiempo de espera basada en 2 minutos por turno

## 📱 Características Técnicas

### **Compatibilidad**
- Funciona en navegadores web modernos
- Responsive (se adapta a móviles y tablets)
- Conexión a internet requerida
  
### **Seguridad**
- Datos almacenados en Firebase
- Sesiones locales en el navegador
- No se requieren contraseñas (acceso por documento)

### **Notificaciones en Tiempo Real**
- Sistema de notificaciones push
- Actualizaciones automáticas sin recargar página
- Sincronización entre múltiples dispositivos

## Preguntas Frecuentes

**¿Puedo tener múltiples turnos activos?**
No, solo puedes tener un turno activo a la vez.

**¿Qué pasa si pierdo mi turno?**
El sistema mantiene tu turno hasta que sea atendido o lo canceles.

**¿Puedo cambiar de especialidad después de solicitar el turno?**
Sí, usando la función "Actualizar turno", pero puede cambiar tu médico asignado.

**¿El administrador puede ver mi información personal?**
El administrador solo ve tu nombre y número de turno, no información médica.

**¿Qué pasa si se cae el sistema?**
Los datos están respaldados en Firebase y se recuperan automáticamente al reconectarse.
