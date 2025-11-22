from typing import List
from fastapi import HTTPException
from config.databases import db
from schemas.consultorio import Consultorio,ConsultorioIn

async def get_all_consultorios() -> List[Consultorio]:
    """Obtiene todos los consultorios de la base de datos."""
    query = "SELECT id, numero, ubicacion, tipo FROM consultorios ORDER BY numero"
    try:
        return await db.fetch_all(query=query) # type: ignore
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener consultorios: {str(e)}")


async def update_consultorio(consultorio_id: int, consultorio: ConsultorioIn) -> Consultorio:
    query = """
        UPDATE consultorios
        SET numero = :numero,
            ubicacion = :ubicacion,
            tipo = :tipo     
        WHERE id = :id
    """
    values = {**consultorio.dict(), "id": consultorio_id}
    await db.execute(query=query, values=values)
    return {**consultorio.dict(), "id": consultorio_id} # type: ignore
