from fastapi import FastAPI
from config.databases import db
from routers import consultorio,turno,medico,cliente,horarios_medicos

# --- LOG DE DEBUG 1 ---
print("\n[DEBUG] main.py: Iniciando importaciones...")
try:
    from routers import auth
    print("[DEBUG] main.py: 'from routers import auth' - ¡ÉXITO!")
except ImportError as e:
    print(f"[DEBUG] main.py: ¡¡¡ERROR CRÍTICO!!! 'from routers import auth' - ¡FALLÓ!")
    print(f"[DEBUG] main.py: Causa: {e}")
    auth = None
# ----------------------

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.connect()
    print("✅ Conexión a la base de datos establecida.")


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()
    print("❌ Conexión a la base de datos cerrada.")


@app.get("/")
async def root():
    return {"message": "Bienvenidos a mi API REST"}


print("\n[DEBUG] main.py: Configurando routers...")

if auth:
    app.include_router(auth.router)
    print("[DEBUG] main.py: Router de autenticación (/auth) INCLUIDO.")
else:
    print("[DEBUG] main.py: Router de autenticación NO INCLUIDO (la importación falló).")
# ----------------------------------------


app.include_router(consultorio.router,prefix="/consultorios")
print("[DEBUG] main.py: Router de consultorios (/consultorios) INCLUIDO.")

app.include_router(turno.router,prefix="/turnos")
print("[DEBUG] main.py: Router de turnos (/turnos) INCLUIDO.")

app.include_router(medico.router,prefix="/medicos")
print("[DEBUG] main.py: Router de medicos (/medicos) INCLUIDO.")

app.include_router(cliente.router,prefix="/clientes")
print("[DEBUG] main.py: Router de clientes (/clientes) INCLUIDO.")

app.include_router(horarios_medicos.router,prefix="/horarios_medicos")
print("[DEBUG] main.py: Router de horarios_medicos (/horarios_medicos) INCLUIDO.")