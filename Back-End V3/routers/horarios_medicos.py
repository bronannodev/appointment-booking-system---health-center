from typing import List
# --- MODIFICACIÓN: Importar el nuevo schema ---
from schemas.horarios_medicos import Horario_Medico, Horario_MedicoIn, HorarioDisponible
# ----------------------------------------------
import services.horarios_medicos as service
from fastapi import APIRouter

router = APIRouter(tags=["horarios_medicos"])

@router.get("/", response_model=List[Horario_Medico])
async def read_horarios_medicos():
    return await service.get_all_horarios_medicos()

@router.get("/por-medico/{medico_id}", response_model=List[Horario_Medico])
async def read_horarios_medico_by_id(medico_id: int):
    return await service.get_horarios_medico_by_id(medico_id)   

@router.get("/{id}", response_model=Horario_Medico)
async def read_horario_medico(id: int):
    return await service.get_horario_id(id) 

@router.post("/", response_model=Horario_Medico)
async def create_horario_medico(horario_medico: Horario_MedicoIn):
    return await service.create_horario_medico(horario_medico)

@router.put("/{id}", response_model=Horario_Medico)
async def update_horario_medico(id: int, horario_medico: Horario_MedicoIn):
    return await service.update_horario_medico(id, horario_medico)

@router.delete("/{id}")
async def delete_horario_medico(id: int):
    return await service.delete_horario_medico(id)

# --- Endpoint para slots disponibles (sin cambios respecto a la vez anterior) ---
@router.get("/disponibles/", response_model=List[HorarioDisponible], tags=["horarios_medicos"])
async def read_horarios_disponibles():
    """
    Obtiene una lista generada de todos los slots de horarios futuros
    que aún no han sido reservados por un turno.
    """
    return await service.get_available_slots()