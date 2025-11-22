from fastapi import APIRouter, Depends,HTTPException,status
from schemas.medico import Medico, MedicoIn
import services.medico as service
from fastapi import HTTPException, status
from typing import List,Annotated
from pydantic import BaseModel

router= APIRouter(tags=["medicos"])
class MedicoStats(BaseModel):
    turnos_hoy: int
    pacientes_totales: int

@router.get("/{medico_id}/estadisticas", response_model=MedicoStats)
async def get_medico_estadisticas(medico_id: int):
    """Obtiene estadísticas rápidas para el dashboard del médico."""
    return await service.get_medico_estadisticas(medico_id)


@router.put("/{id}", response_model=Medico)
async def update_Medico(id: int, Medico: MedicoIn):
    return await service.update_medico(id, Medico)

@router.delete("/{id}")
async def delete_Medico(id: int):
    return await service.delete_medico(id)
