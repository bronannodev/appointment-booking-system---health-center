from pydantic import BaseModel
from datetime import datetime,date

class ClienteIn(BaseModel):
    nombre : str
    apellido : str
    dni : int
    email : str
    telefono : str
    fecha_nacimiento : date
    contraseña : str 

class Cliente(BaseModel):
    id: int
    nombre : str
    apellido : str
    dni : int
    email : str
    telefono : str
    fecha_nacimiento : date