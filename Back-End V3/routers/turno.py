from fastapi import APIRouter,Depends,HTTPException,status
from schemas.turno import Turno, TurnoIn,TurnoCompleto, EstadoTurno 
import services.turnos as service
from fastapi import HTTPException, status
from typing import List,Annotated


router= APIRouter(tags=["turnos"])


@router.get("/cliente/{cliente_id}", response_model=List[TurnoCompleto])
async def get_turnos_cliente_completos(cliente_id:int):
    return await service.get_turnos_cliente_completos(cliente_id)


@router.get("/medico/{medico_id}", response_model=List[TurnoCompleto])
async def get_turnos_medico_completos(medico_id:int):
    return await service.get_turnos_medico_completos(medico_id)


@router.post("/", response_model=Turno)
async def create_turno(turno: TurnoIn):
    return await service.create_turno(turno)

@router.put("/{id}", response_model=Turno)
async def update_turno(id: int, turno: TurnoIn):
    return await service.update_turno(id, turno)

@router.delete("/{id}")
async def delete_turno(id: int):
    return await service.delete_turno(id)

@router.get("/cliente/{cliente_id}/proximo", response_model=TurnoCompleto)
async def get_proximo_turno_cliente(cliente_id: int):
    turno = await service.get_proximo_turno_cliente(cliente_id)
    if not turno:
        raise HTTPException(status_code=404, detail="No se encontró un próximo turno.")
    return turno

@router.put("/{id}/confirmar", response_model=TurnoCompleto)
async def confirm_turno_endpoint(id: int):
    """
    Permite a un médico Aceptar (confirmar) un turno pendiente.
    """
    try:
        return await service.update_estado_turno(id, EstadoTurno.CONFIRMADO)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno servidor: {e}")

@router.put("/{id}/cancelar", response_model=TurnoCompleto)
async def cancel_turno_endpoint(id: int):
    """
    Permite a un médico o paciente Cancelar un turno.
    """
    try:
        return await service.update_estado_turno(id, EstadoTurno.CANCELADO)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno servidor: {e}")
