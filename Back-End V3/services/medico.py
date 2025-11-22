from typing import List
from fastapi import HTTPException
from config.databases import db
from schemas.medico import Medico, MedicoIn
from services.auth import get_password_hash


async def get_medico_estadisticas(medico_id: int) -> dict:
    """Calcula estadísticas para el dashboard del médico."""
    try:
        # 1. Contar turnos de hoy (pendientes o confirmados)
        query_turnos_hoy = """
            SELECT COUNT(t.id) 
            FROM turnos t
            JOIN horarios_medicos hm ON t.horarios_medicos_id = hm.id
            WHERE hm.medicos_id = :medico_id
              AND DATE(t.fecha_hora) = CURDATE()
              AND t.estado IN ('pendiente', 'confirmado')
        """
        turnos_hoy = await db.fetch_val(query=query_turnos_hoy, values={"medico_id": medico_id})
        
        # 2. Contar pacientes totales (únicos)
        query_pacientes = """
            SELECT COUNT(DISTINCT t.clientes_id)
            FROM turnos t
            JOIN horarios_medicos hm ON t.horarios_medicos_id = hm.id
            WHERE hm.medicos_id = :medico_id
        """
        pacientes_totales = await db.fetch_val(query=query_pacientes, values={"medico_id": medico_id})

        return {
            "turnos_hoy": turnos_hoy,
            "pacientes_totales": pacientes_totales
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al calcular estadísticas: {str(e)}")


async def update_medico(medico_id: int, medico: MedicoIn) -> Medico:
    query = """
        UPDATE medicos
        SET nombre = :nombre,
            apellido = :apellido,
            dni = :dni,
            email = :email,
            telefono = :telefono,
            especialidad = :especialidad,
            matricula = :matricula,
            contraseña = :contraseña
        WHERE id = :id
    """
    # MODIFICADO: Usa passlib (bcrypt) en lugar de sha256
    hashed_password = get_password_hash(medico.contraseña)
    values = {**medico.dict(), "id": medico_id, "contraseña": hashed_password}

    await db.execute(query=query, values=values)
    return {**medico.dict(), "id": medico_id}  # type: ignore

#-Eliminamos medico-----------------------------------------------------------------------------
async def delete_medico(id: int) -> dict:
    query = "DELETE FROM medicos WHERE id = :id"
    result = await db.execute(query=query, values={"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    return {"message": "Médico eliminado correctamente"}