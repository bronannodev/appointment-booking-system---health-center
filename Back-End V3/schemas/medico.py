from pydantic import BaseModel

class MedicoIn(BaseModel):
    nombre : str
    apellido : str
    dni : int
    email: str 
    telefono : str
    especialidad : str
    matricula : str
    contraseña : str

class Medico(BaseModel):
    id: int
    nombre : str
    apellido : str
    dni : int
    email: str 
    telefono : str
    especialidad : str
    matricula : str
    contraseña : str
 
 
class MedicoPublic(BaseModel):
    id: int
    nombre: str
    apellido: str
    especialidad: str
    matricula: str

    
