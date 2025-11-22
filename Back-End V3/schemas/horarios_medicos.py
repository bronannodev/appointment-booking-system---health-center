from pydantic import BaseModel
from datetime import datetime, time, date

class Horario_MedicoIn(BaseModel):
    dia_semana: int
    hora_inicio: time
    hora_fin: time
    medicos_id: int
    consultorios_id: int

class Horario_Medico(BaseModel):   
    id: int
    dia_semana: int
    hora_inicio: time
    hora_fin: time
    medicos_id: int
    consultorios_id: int 

class HorarioDisponible(BaseModel):
    id: str 
    horarios_medico_id: int
    fecha_hora: datetime
    fecha_turno: date
    hora_turno: str 
    medico_nombre: str
    medico_apellido: str
    especialidad: str
    profesional_nombre_completo: str
    consultorio_numero: str