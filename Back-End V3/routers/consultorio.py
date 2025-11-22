from typing import List
from fastapi import APIRouter
from schemas.consultorio import ConsultorioIn,Consultorio
import services.consultorio as service

router = APIRouter(tags=["consultorios"])

@router.get("/", response_model=List[Consultorio])
async def read_all_consultorios():
    """Obtiene una lista de todos los consultorios."""
    return await service.get_all_consultorios()

@router.put("/{id}", response_model=Consultorio)
async def update_Consultorio(id: int, consultorio: ConsultorioIn):
    return await service.update_consultorio(id,consultorio)

