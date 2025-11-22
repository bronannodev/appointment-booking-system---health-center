from fastapi import APIRouter, HTTPException
from typing import List
from schemas.cliente import Cliente, ClienteIn
import services.cliente as service

router = APIRouter(tags=["clientes"])

@router.get("/{id}", response_model=Cliente)
async def read_cliente(id: int):
    return await service.get_cliente_by_id(id)


@router.post("/", response_model=Cliente)
async def registrar_cliente(cliente: ClienteIn):
    return await service.registrar_cliente_sp(cliente)


@router.put("/{id}", response_model=Cliente)
async def update_cliente(id: int, cliente: ClienteIn):
    return await service.update_cliente(id, cliente)


@router.delete("/{id}")
async def delete_cliente(id: int):
    return await service.delete_cliente(id)
