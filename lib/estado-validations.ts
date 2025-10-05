// Estado transition validations

export type EstadoSolicitud = "pre_filtro" | "entrevista" | "aprobada" | "rechazada" | "cancelada"

export interface TransitionRule {
  from: EstadoSolicitud
  to: EstadoSolicitud[]
}

// Define valid state transitions
const transitionRules: TransitionRule[] = [
  {
    from: "pre_filtro",
    to: ["entrevista", "rechazada", "cancelada"],
  },
  {
    from: "entrevista",
    to: ["aprobada", "rechazada", "cancelada"],
  },
  {
    from: "aprobada",
    to: [], // Final state - no transitions allowed
  },
  {
    from: "rechazada",
    to: [], // Final state - no transitions allowed
  },
  {
    from: "cancelada",
    to: [], // Final state - no transitions allowed
  },
]

export function isValidTransition(from: EstadoSolicitud, to: EstadoSolicitud): boolean {
  // Same state is not a valid transition
  if (from === to) {
    return false
  }

  const rule = transitionRules.find((r) => r.from === from)
  if (!rule) {
    return false
  }

  return rule.to.includes(to)
}

export function getValidNextStates(currentState: EstadoSolicitud): EstadoSolicitud[] {
  const rule = transitionRules.find((r) => r.from === currentState)
  return rule ? rule.to : []
}

export function getTransitionError(from: EstadoSolicitud, to: EstadoSolicitud): string {
  if (from === to) {
    return "El estado seleccionado es el mismo que el actual"
  }

  const validStates = getValidNextStates(from)

  if (validStates.length === 0) {
    return `No se puede cambiar el estado desde "${getEstadoLabel(from)}" porque es un estado final`
  }

  return `No se puede cambiar de "${getEstadoLabel(from)}" a "${getEstadoLabel(to)}". Estados válidos: ${validStates.map(getEstadoLabel).join(", ")}`
}

export function getEstadoLabel(estado: EstadoSolicitud): string {
  const labels: Record<EstadoSolicitud, string> = {
    pre_filtro: "Pre-Filtro",
    entrevista: "Entrevista",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
    cancelada: "Cancelada",
  }
  return labels[estado]
}

export function getEstadoDescription(estado: EstadoSolicitud): string {
  const descriptions: Record<EstadoSolicitud, string> = {
    pre_filtro: "La solicitud está siendo revisada inicialmente",
    entrevista: "El postulante ha pasado el pre-filtro y se coordinará una entrevista",
    aprobada: "La solicitud ha sido aprobada y el postulante puede adoptar",
    rechazada: "La solicitud no cumple con los requisitos necesarios",
    cancelada: "La solicitud fue cancelada por el postulante o administrador",
  }
  return descriptions[estado]
}
