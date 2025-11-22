from typing import List
from fastapi import HTTPException
from config.databases import db
from schemas.turno import Turno, TurnoIn,TurnoCompleto, EstadoTurno
from schemas.medico import MedicoPublic
from schemas.consultorio import Consultorio
from datetime import datetime, time, date
import datetime as dt


# turnos por id de medico
async def get_turnos_cliente_completos(cliente_id: int):
    query = """
        SELECT 
            t.id AS turno_id, t.fecha_hora, t.estado, t.motivo, t.fecha_creacion,
            t.clientes_id, t.horarios_medicos_id,
            m.id AS medico_id, m.nombre, m.apellido, m.especialidad, m.matricula,
            c.id AS consultorio_id, c.numero, c.ubicacion, c.tipo,
            
            -- --- AÑADIDO ---
            cl.nombre AS cliente_nombre,
            cl.apellido AS cliente_apellido
            -- --- FIN ---
            
        FROM turnos t
        JOIN horarios_medicos hm ON t.horarios_medicos_id = hm.id
        JOIN medicos m ON hm.medicos_id = m.id
        JOIN consultorios c ON hm.consultorios_id = c.id
        
        -- --- AÑADIDO ---
        LEFT JOIN clientes cl ON t.clientes_id = cl.id
        -- --- FIN ---
        
        WHERE t.clientes_id = :cliente_id
        ORDER BY t.fecha_hora DESC
    """
    rows = await db.fetch_all(query=query, values={"cliente_id": cliente_id})

    turnos = []
    for row in rows:
        cliente_nombre_completo = f"{row['cliente_nombre'] or ''} {row['cliente_apellido'] or ''}".strip()

        turno = TurnoCompleto(
            id=row["turno_id"],
            fecha_hora=row["fecha_hora"],
            estado=row["estado"],
            motivo=row["motivo"],
            fecha_creacion=row["fecha_creacion"],
            clientes_id=row["clientes_id"],
            horarios_medicos_id=row["horarios_medicos_id"],
            medico=MedicoPublic(
                id=row["medico_id"],
                nombre=row["nombre"],
                apellido=row["apellido"],
                especialidad=row["especialidad"],
                matricula=row["matricula"],
            ),
            consultorio=Consultorio(
                id=row["consultorio_id"],
                numero=row["numero"],
                ubicacion=row["ubicacion"],
                tipo=row["tipo"],
            ),
            cliente_nombre_completo=cliente_nombre_completo or "N/A"
        )
        turnos.append(turno)
    return turnos


# turnos que tiene cada medico
async def get_turnos_medico_completos(medico_id: int):
    query = """
        SELECT 
            t.id AS turno_id, t.fecha_hora, t.estado, t.motivo, t.fecha_creacion,
            t.clientes_id, t.horarios_medicos_id,
            m.id AS medico_id, m.nombre, m.apellido, m.especialidad, m.matricula,
            c.id AS consultorio_id, c.numero, c.ubicacion, c.tipo,

            -- --- AÑADIDO ---
            cl.nombre AS cliente_nombre,
            cl.apellido AS cliente_apellido
            -- --- FIN ---
            
        FROM turnos t
        JOIN horarios_medicos hm ON t.horarios_medicos_id = hm.id
        JOIN medicos m ON hm.medicos_id = m.id
        JOIN consultorios c ON hm.consultorios_id = c.id
        
        -- --- AÑADIDO ---
        LEFT JOIN clientes cl ON t.clientes_id = cl.id
        -- --- FIN ---
        
        WHERE m.id = :medico_id
        ORDER BY t.fecha_hora DESC
    """
    rows = await db.fetch_all(query=query, values={"medico_id": medico_id})

    turnos = []
    for row in rows:
        cliente_nombre_completo = f"{row['cliente_nombre'] or ''} {row['cliente_apellido'] or ''}".strip()
        
        turno = TurnoCompleto(
            id=row["turno_id"],
            fecha_hora=row["fecha_hora"],
            estado=row["estado"],
            motivo=row["motivo"],
            fecha_creacion=row["fecha_creacion"],
            clientes_id=row["clientes_id"],
            horarios_medicos_id=row["horarios_medicos_id"],
            medico=MedicoPublic(
                id=row["medico_id"],
                nombre=row["nombre"],
                apellido=row["apellido"],
                especialidad=row["especialidad"],
                matricula=row["matricula"],
            ),
            consultorio=Consultorio(
                id=row["consultorio_id"],
                numero=row["numero"],
                ubicacion=row["ubicacion"],
                tipo=row["tipo"],
            ),
            cliente_nombre_completo=cliente_nombre_completo or "N/A"
        )
        turnos.append(turno)
    return turnos


async def get_proximo_turno_cliente(cliente_id: int):
    """
    Busca el turno más próximo en el futuro para un cliente,
    que esté 'pendiente' o 'confirmado'.
    """
    query = """
        SELECT 
            t.id AS turno_id, t.fecha_hora, t.estado, t.motivo, t.fecha_creacion,
            t.clientes_id, t.horarios_medicos_id,
            m.id AS medico_id, m.nombre, m.apellido, m.especialidad, m.matricula,
            c.id AS consultorio_id, c.numero, c.ubicacion, c.tipo,

            -- --- AÑADIDO ---
            cl.nombre AS cliente_nombre,
            cl.apellido AS cliente_apellido
            -- --- FIN ---
            
        FROM turnos t
        JOIN horarios_medicos hm ON t.horarios_medicos_id = hm.id
        JOIN medicos m ON hm.medicos_id = m.id
        JOIN consultorios c ON hm.consultorios_id = c.id
        
        -- --- AÑADIDO ---
        LEFT JOIN clientes cl ON t.clientes_id = cl.id
        -- --- FIN ---
        
        WHERE t.clientes_id = :cliente_id
          AND t.estado IN ('pendiente', 'confirmado')
          AND t.fecha_hora > NOW()
        ORDER BY t.fecha_hora ASC
        LIMIT 1
    """
    row = await db.fetch_one(query=query, values={"cliente_id": cliente_id})

    if not row:
        return None

    cliente_nombre_completo = f"{row['cliente_nombre'] or ''} {row['cliente_apellido'] or ''}".strip()

    return TurnoCompleto(
        id=row["turno_id"],
        fecha_hora=row["fecha_hora"],
        estado=row["estado"],
        motivo=row["motivo"],
        fecha_creacion=row["fecha_creacion"],
        clientes_id=row["clientes_id"],
        horarios_medicos_id=row["horarios_medicos_id"],
        medico=MedicoPublic(
            id=row["medico_id"],
            nombre=row["nombre"],
            apellido=row["apellido"],
            especialidad=row["especialidad"],
            matricula=row["matricula"],
        ),
        consultorio=Consultorio(
            id=row["consultorio_id"],
            numero=row["numero"],
            ubicacion=row["ubicacion"],
            tipo=row["tipo"],
        ),
        cliente_nombre_completo=cliente_nombre_completo or "N/A"
    )
# -------------------------


#funcionando en postman
async def create_turno(turno: TurnoIn) -> Turno:
    query = """
        CALL crear_turno(:p_cliente_id, :p_horarios_medico_id, :p_fecha_hora, :p_motivo)
    """
    values = {
        "p_cliente_id": turno.clientes_id,
        "p_horarios_medico_id": turno.horarios_medicos_id,
        "p_fecha_hora": turno.fecha_hora,
        "p_motivo": turno.motivo,
    }
    row = await db.fetch_one(query=query,values=values)
    
    # Manejo de error si el SP falla (ej. DNI duplicado)
    if not row or "id" not in row:
        error_detail = "El SP no devolvió un ID. El turno puede no haberse creado."
        raise HTTPException(status_code=400, detail=error_detail)

    turno_id = row["id"]
    return{**turno.dict(),"id":turno_id,"estado":"pendiente"}  #type: ignore


async def update_turno(id: int, turno: TurnoIn) -> Turno:
    try:
        query = """
            UPDATE turnos
            SET fecha_hora = :fecha_hora,
                estado = :estado,
                motivo = :motivo,
                fecha_creacion = :fecha_creacion,
                clientes_id = :clientes_id,
                horarios_medicos_id = :horarios_medicos_id
            WHERE id = :id
        """
        
        values = {**turno.dict(), "id": id}
        await db.execute(query=query, values=values)
        return {**turno.dict(), "id": id} #type: ignore

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar turno: {str(e)}"
        )
    

async def update_estado_turno(id: int, estado: EstadoTurno) -> TurnoCompleto:
    """Actualiza solo el estado de un turno."""
    try:
        query_select = "SELECT * FROM turnos WHERE id = :id"
        turno_db = await db.fetch_one(query=query_select, values={"id": id})
        
        if not turno_db:
            raise HTTPException(status_code=404, detail="Turno no encontrado")

        query_update = """
            UPDATE turnos
            SET estado = :estado
            WHERE id = :id
        """
        await db.execute(query=query_update, values={"estado": estado.value, "id": id})
        
        query_completo = """
            SELECT 
                t.id AS turno_id, t.fecha_hora, t.estado, t.motivo, t.fecha_creacion,
                t.clientes_id, t.horarios_medicos_id,
                m.id AS medico_id, m.nombre, m.apellido, m.especialidad, m.matricula,
                c.id AS consultorio_id, c.numero, c.ubicacion, c.tipo,
                cl.nombre AS cliente_nombre,
                cl.apellido AS cliente_apellido
            FROM turnos t
            JOIN horarios_medicos hm ON t.horarios_medicos_id = hm.id
            JOIN medicos m ON hm.medicos_id = m.id
            JOIN consultorios c ON hm.consultorios_id = c.id
            LEFT JOIN clientes cl ON t.clientes_id = cl.id
            WHERE t.id = :id
        """
        row = await db.fetch_one(query=query_completo, values={"id": id})

        if not row:
             raise HTTPException(status_code=404, detail="Turno no encontrado post-actualización.")

        cliente_nombre_completo = f"{row['cliente_nombre'] or ''} {row['cliente_apellido'] or ''}".strip()

        return TurnoCompleto(
            id=row["turno_id"],
            fecha_hora=row["fecha_hora"],
            estado=row["estado"],
            motivo=row["motivo"],
            fecha_creacion=row["fecha_creacion"],
            clientes_id=row["clientes_id"],
            horarios_medicos_id=row["horarios_medicos_id"],
            medico=MedicoPublic(
                id=row["medico_id"],
                nombre=row["nombre"],
                apellido=row["apellido"],
                especialidad=row["especialidad"],
                matricula=row["matricula"],
            ),
            consultorio=Consultorio(
                id=row["consultorio_id"],
                numero=row["numero"],
                ubicacion=row["ubicacion"],
                tipo=row["tipo"],
            ),
            cliente_nombre_completo=cliente_nombre_completo or "N/A"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al actualizar estado del turno: {str(e)}"
        )
# -------------------------


async def delete_turno(id: int) -> dict:
    query = "DELETE FROM turnos WHERE id = :id"
    result = await db.execute(query=query, values={"id": id})
    if not result:
        raise HTTPException(status_code=404,detail="Cliente no encontrado")
    return {"message": "Turno eliminado correctamente"}