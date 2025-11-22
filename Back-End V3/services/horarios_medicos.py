from typing import List
from fastapi import HTTPException
from config.databases import db
from schemas.horarios_medicos import Horario_Medico, Horario_MedicoIn, HorarioDisponible
from datetime import datetime, timedelta, date, time
import datetime as dt # <-- MODIFICACIÓN: Importar dt

# --- MODIFICACIÓN: Añadir esta función helper al inicio ---
def _convert_timedelta_to_time(td: dt.timedelta) -> time:
    """Convierte un objeto timedelta a time."""
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    try:
        return time(hour=hours, minute=minutes, second=seconds)
    except ValueError:
        print(f"Advertencia: No se pudo convertir timedelta {td} a time.")
        return time(0, 0, 0)

# --- MODIFICACIÓN: Añadir helper para procesar la fila ---
def _process_horario_row(row):
    """Convierte los timedelta de una fila de horario a time."""
    if not row:
        return None
    row_dict = dict(row) # Convertir el Record a dict
    
    # Corregir tipos de hora
    if 'hora_inicio' in row_dict and isinstance(row_dict['hora_inicio'], dt.timedelta):
        row_dict['hora_inicio'] = _convert_timedelta_to_time(row_dict['hora_inicio'])
    if 'hora_fin' in row_dict and isinstance(row_dict['hora_fin'], dt.timedelta):
        row_dict['hora_fin'] = _convert_timedelta_to_time(row_dict['hora_fin'])
        
    return row_dict
# --- FIN DE MODIFICACIONES ---


async def get_all_horarios_medicos() -> List[Horario_Medico]:
    query = "SELECT * from horarios_medicos"
    rows = await db.fetch_all(query=query)
    # --- MODIFICACIÓN: Procesar las filas ---
    return [_process_horario_row(row) for row in rows]  # type: ignore

async def get_horarios_medico_by_id(medico_id: int) -> List[Horario_Medico]:
    query = "SELECT * from horarios_medicos WHERE medicos_id = :medico_id"
    rows = await db.fetch_all(query=query, values={"medico_id": medico_id})
    if not rows:
        raise HTTPException(status_code=404, detail="Horarios del médico no encontrados")
    # --- MODIFICACIÓN: Procesar las filas ---
    return [_process_horario_row(row) for row in rows]  # type: ignore

async def get_horario_id(id: int) -> Horario_Medico:
    query = "SELECT * from horarios_medicos WHERE id = :id"
    row = await db.fetch_one(query=query, values={"id": id})
    if not row:
        raise HTTPException(status_code=404, detail="Horario médico no encontrado")
    # --- MODIFICACIÓN: Procesar la fila ---
    return _process_horario_row(row)  # type: ignore

async def create_horario_medico(horario_medico:Horario_MedicoIn)-> Horario_Medico:
    query = """
        INSERT INTO horarios_medicos (dia_semana, hora_inicio, hora_fin, medicos_id, consultorios_id)
        VALUES (:dia_semana, :hora_inicio, :hora_fin, :medicos_id, :consultorios_id)
    """
    values = horario_medico.dict()
    last_record_id = await db.execute(query=query, values=values)
    
    # Retornamos un dict que coincide con el schema (incluyendo el ID)
    # No es necesario convertir el tiempo aquí, ya que Pydantic lo manejó
    return {**values, "id": last_record_id}  # type: ignore

async def update_horario_medico(id: int, horario_medico: Horario_MedicoIn) -> Horario_Medico:
    query = """
        UPDATE horarios_medicos
        SET dia_semana = :dia_semana,
            hora_inicio = :hora_inicio,
            hora_fin = :hora_fin,
            medicos_id = :medicos_id
            consultorios_id = :consultorios_id
        WHERE id = :id
    """
    values = {**horario_medico.dict(), "id": id}
    await db.execute(query=query, values=values)
    return {**values, "id": id}  # type: ignore

async def delete_horario_medico(id: int) -> dict:
    query = "DELETE FROM horarios_medicos WHERE id = :id"
    result = await db.execute(query=query, values={"id": id})
    if not result:
        raise HTTPException(status_code=404, detail="Horario médico no encontrado")
    return {"message": "Horario médico eliminado correctamente"}


async def get_available_slots(days_in_future: int = 14) -> List[HorarioDisponible]:
    """
    Genera una lista de slots de horarios disponibles que aún no han sido reservados.
    """
    query_schedules = """
        SELECT 
            hm.id AS horarios_medico_id, hm.dia_semana, hm.hora_inicio,
            m.nombre AS medico_nombre, m.apellido AS medico_apellido, m.especialidad,
            c.numero AS consultorio_numero
        FROM horarios_medicos hm
        JOIN medicos m ON hm.medicos_id = m.id
        JOIN consultorios c ON hm.consultorios_id = c.id
    """
    all_schedules = await db.fetch_all(query_schedules)
    
    query_turnos = """
        SELECT horarios_medicos_id, fecha_hora
        FROM turnos
        WHERE estado IN ('pendiente', 'confirmado') AND fecha_hora > NOW()
    """
    reserved_rows = await db.fetch_all(query_turnos)
    
    reserved_set = set()
    for turno in reserved_rows:
        if isinstance(turno['fecha_hora'], datetime):
            reserved_set.add(f"{turno['horarios_medicos_id']}-{turno['fecha_hora'].isoformat()}")

    available_slots = []
    today = date.today()

    for i in range(days_in_future):
        current_date = today + timedelta(days=i)
        
        py_weekday = current_date.weekday()
        db_dia_semana = (py_weekday + 1) % 7
        
        matching_schedules = [s for s in all_schedules if s['dia_semana'] == db_dia_semana]
        
        for schedule in matching_schedules:
            
            slot_time = schedule['hora_inicio']
            
            # AHORA usamos la función helper para convertir
            if isinstance(slot_time, timedelta):
                slot_time = _convert_timedelta_to_time(slot_time)
            elif not isinstance(slot_time, time):
                print(f"Advertencia: 'hora_inicio' no es un objeto 'time' válido: {slot_time}")
                continue

            try:
                slot_datetime = datetime.combine(current_date, slot_time)
            except TypeError:
                print(f"Error combinando fecha {current_date} y hora {slot_time}")
                continue

            if slot_datetime < datetime.now():
                continue
                
            slot_key = f"{schedule['horarios_medico_id']}-{slot_datetime.isoformat()}"
            
            if slot_key not in reserved_set:
                
                profesional_nombre = f"{schedule['medico_nombre']} {schedule['medico_apellido']}".strip()
                hora_turno_str = slot_time.strftime('%H:%M')
                
                available_slots.append(
                    HorarioDisponible(
                        id=slot_key, 
                        horarios_medico_id=schedule['horarios_medico_id'],
                        fecha_hora=slot_datetime,
                        fecha_turno=current_date,
                        hora_turno=hora_turno_str,
                        medico_nombre=schedule['medico_nombre'],
                        medico_apellido=schedule['medico_apellido'],
                        especialidad=schedule['especialidad'],
                        profesional_nombre_completo=profesional_nombre,
                        consultorio_numero=schedule['consultorio_numero']
                    )
                )
                        
    return available_slots