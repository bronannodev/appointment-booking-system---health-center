from pydantic import BaseModel

class ConsultorioIn(BaseModel):
    numero : str
    ubicacion : str
    tipo : str

class Consultorio(BaseModel):
    id: int
    numero : str
    ubicacion : str
    tipo : str
