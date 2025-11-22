from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    id: Optional[int] = None
    rol: Optional[str] = None
    nombre: Optional[str] = None

class User(BaseModel):
    id: int
    email: str
    nombre: str
    rol: str
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str