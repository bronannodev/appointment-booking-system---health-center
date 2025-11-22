from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional
from schemas.medico import MedicoPublic
from schemas.consultorio import Consultorio

class EstadoTurno(str,Enum):
    PENDIENTE ="pendiente"
    CONFIRMADO ="confirmado"
    CANCELADO ="cancelado"
    COMPLETADO ="completado"

class TurnoIn(BaseModel):
    fecha_hora : datetime
    estado : EstadoTurno
    motivo : str
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    clientes_id : int
    horarios_medicos_id : int

class Turno(BaseModel):
    id: int
    fecha_hora : datetime
    estado : EstadoTurno
    motivo : str
    fecha_creacion: datetime 
    clientes_id : int
    horarios_medicos_id : int
    
class TurnoCompleto(Turno):
    medico: MedicoPublic
    consultorio: Consultorio
    cliente_nombre_completo: Optional[str] = None