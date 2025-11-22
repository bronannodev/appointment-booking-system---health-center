from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
import services.auth as service

router = APIRouter(tags=["auth"])

@router.post("/auth/token/paciente")
async def login_paciente_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    """
    Endpoint de login para Pacientes (Clientes).
    Espera 'username' (email) y 'password'.
    """
    access_token = await service.authenticate_user(
        form_data.username, 
        form_data.password, 
        "cliente"
    )
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo electrónico o la contraseña son incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/token/profesional")
async def login_profesional_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    """
    Endpoint de login para Profesionales (Medicos).
    Espera 'username' (email) y 'password'.
    """
    access_token = await service.authenticate_user(
        form_data.username, 
        form_data.password, 
        "medico"
    )
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo electrónico o la contraseña son incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": access_token, "token_type": "bearer"}