from fastapi import HTTPException
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from config.databases import db
from typing import Literal

# --- Configuración de Seguridad (sin cambios) ---
SECRET_KEY = "tu_clave_secreta_muy_segura_¡cambiala!"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15 

# --- Funciones de Hashing (MODIFICADAS) ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contraseña en texto plano contra un hash de bcrypt.
    """
    try:
        # Convertimos ambas a bytes para que bcrypt las compare
        plain_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        
        # bcrypt.checkpw devuelve True si coinciden
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception as e:
        # Esto puede pasar si el hash es inválido o tiene un formato incorrecto
        print(f"Error durante la verificación de bcrypt: {e}")
        return False

def get_password_hash(password: str) -> str:
    """
    Genera un hash de bcrypt a partir de una contraseña en texto plano.
    """
    # bcrypt requiere que la contraseña esté en bytes
    password_bytes = password.encode('utf-8')
    
    # Generamos un "salt" (factor aleatorio)
    salt = bcrypt.gensalt()
    
    # Hasheamos la contraseña
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    
    # Devolvemos el hash como un string (decodificado) para guardarlo en la BD
    return hashed_bytes.decode('utf-8')

# --- FIN DE MODIFICACIONES DE HASHING ---


# --- Funciones de Token JWT (sin cambios) ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Lógica de Autenticación (sin cambios) ---

async def get_user(email: str, user_type: Literal['cliente', 'medico']):
    """Busca un usuario (cliente o medico) por su email."""
    table_name = "clientes" if user_type == 'cliente' else "medicos"
    query = f"SELECT id, nombre, apellido, dni, email, telefono, contraseña FROM {table_name} WHERE email = :email"
    user = await db.fetch_one(query=query, values={"email": email})
    return user

async def authenticate_user(email: str, password: str, user_type: Literal['cliente', 'medico']):
    """
    Autentica a un usuario. Si es exitoso, devuelve un token de acceso
    que ahora incluye el nombre del usuario.
    """
    user = await get_user(email, user_type)
    if not user:
        print(f"Auth attempt failed: User not found for email {email} as {user_type}")
        return False 

    user_dict = dict(user)

    # Verificamos la contraseña (AHORA USA LA NUEVA FUNCIÓN)
    if not verify_password(password, user_dict["contraseña"]):
        print(f"Auth attempt failed: Invalid password for email {email}")
        return False 

    access_token_payload = {
        "sub": user_dict["email"],
        "id": user_dict["id"],
        "rol": user_type,
        "nombre": user_dict.get("nombre", "") 
    }
    access_token = create_access_token(data=access_token_payload)
    print(f"Auth successful for email {email}. Token created.")
    return access_token