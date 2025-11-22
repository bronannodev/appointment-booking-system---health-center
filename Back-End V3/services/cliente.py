from typing import List
from fastapi import HTTPException
from config.databases import db
from schemas.cliente import Cliente, ClienteIn
# Importa la función de hashing del servicio de auth (que ahora usa argon2)
from services.auth import get_password_hash


# Esta función es necesaria para devolver el cliente después de crearlo
async def get_cliente_by_id(id: int) -> Cliente: 
    query = "SELECT id, nombre, apellido, dni, email, telefono, fecha_nacimiento FROM clientes WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id": id})
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return row  # type: ignore


# ESTA ES LA FUNCIÓN CORRECTA QUE USA TU SP
async def registrar_cliente_sp(cliente: ClienteIn) -> Cliente:
    """
    Llama al procedimiento almacenado registrar_cliente.
    """
    try:
        # 1. Hashea la contraseña usando argon2 (desde services/auth.py)
        hashed_password = get_password_hash(cliente.contraseña)

        # 2. Llama al procedimiento almacenado
        query = """
            CALL registrar_cliente(:nombre, :apellido, :dni, :email, :telefono, :fecha_nacimiento, :contraseña)
        """
        values = {
            "nombre": cliente.nombre,
            "apellido": cliente.apellido,
            "dni": cliente.dni,
            "email": cliente.email,
            "telefono": cliente.telefono,
            "fecha_nacimiento": cliente.fecha_nacimiento,
            "contraseña": hashed_password  # Envía el hash argon2
        }

        # 3. Ejecuta el SP y captura el ID que devuelve
        # (Tu SP tiene "SELECT LAST_INSERT_ID() AS id;")
        row = await db.fetch_one(query=query, values=values)
        
        if not row or "id" not in row:
             raise HTTPException(status_code=500, detail="Error: El SP no devolvió el ID del cliente registrado.")

        new_client_id = row["id"]

        # 4. Devuelve el objeto Cliente completo (sin contraseña)
        return await get_cliente_by_id(new_client_id)

    except Exception as e:
        # Si el SP devuelve el error '45000' (DNI/email duplicado), se captura aquí
        raise HTTPException(status_code=400, detail=f"Error al registrar el cliente: {str(e)}")

#-----------------------------------------------------------------------------------------------

async def update_cliente(cliente_id: int, cliente: ClienteIn) -> Cliente:
    query = """
        UPDATE clientes
        SET nombre = :nombre,
            apellido = :apellido,
            dni = :dni,
            email = :email,
            telefono = :telefono,
            fecha_nacimiento = :fecha_nacimiento,
            contraseña = :contraseña
        WHERE id = :id
    """
    hashed_password = get_password_hash(cliente.contraseña)
    values = {**cliente.dict(), "id": cliente_id, "contraseña": hashed_password}

    await db.execute(query=query, values=values)
    
    return await get_cliente_by_id(cliente_id)

#-----------------------------------------------------------------------------------------------

async def delete_cliente(id: int) -> dict:
    query = "DELETE FROM clientes WHERE id = :id"
    result = await db.execute(query=query, values={"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"message": "Cliente eliminado correctamente"}