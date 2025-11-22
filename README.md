# 🏥 Centro de Salud JAVA - Sistema de Gestión de Turnos

> **Proyecto Final - Programación II**
> Desarrollado por: **Grupo JAVA**

Este proyecto consiste en una plataforma web integral para la gestión de turnos médicos. El sistema permite a los pacientes registrarse y solicitar citas de manera intuitiva, mientras que proporciona a los médicos un panel para administrar su agenda y pacientes.

---

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Características Principales](#características-principales)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
5. [Base de Datos](#base-de-datos)
6. [API Endpoints](#api-endpoints)
7. [Autenticación y Seguridad](#autenticación-y-seguridad)
8. [Instalación y Ejecución](#instalación-y-ejecución)

---

## 📖 Descripción del Proyecto

El sistema opera como una plataforma web que conecta pacientes con profesionales de la salud.
* **Perspectiva del Usuario (Paciente):** Tras un inicio de sesión simple, el usuario selecciona especialidad y médico, visualiza un calendario interactivo con días y horarios disponibles, y confirma su turno con un solo clic. El sistema genera un comprobante imprimible.
* **Perspectiva del Médico:** Los profesionales pueden visualizar sus próximos turnos, y tienen la capacidad de aceptarlos o rechazarlos desde su dashboard.

---

## ✨ Características Principales

* **Gestión de Usuarios:** Registro e inicio de sesión seguro con correo y contraseña.
* **Reserva de Turnos:** Selección dinámica de especialidad, médico y horarios.
* **Dashboard Médico:** Visualización y gestión de estado de turnos.
* **Comprobantes:** Generación de detalles del turno para el paciente.
* **Validaciones:** Middleware para verificación de roles y validación de tokens.

---

## 🛠 Tecnologías Utilizadas

### Back-End
* **Lenguaje:** Python.
* **Framework:** FastAPI (Alto rendimiento para construcción de APIs).
* **Seguridad:** Argon2 (Hashing) y JWT (Tokens).
* **Entorno:** Virtualenv (`.venv`).

### Front-End
* **Biblioteca:** React (Vite).
* **Estilos:** Tailwind CSS.
* **Estructura:** Componentes reutilizables y páginas.

### Base de Datos e Infraestructura
* **Motor:** MySQL.
* **Gestión:** MySQL Workbench.
* **Hosting DB:** Railway.
* **Modelado:** Aplicación de 1FN, 2FN y 3FN.

---

## 🏗 Arquitectura del Proyecto

El proyecto sigue una arquitectura modular separando la lógica de negocio, los esquemas de datos y las rutas.

### Estructura del Back-End & Front-End
```bash
/backend
 ├── config/          # Configuración de Base de Datos
 ├── models/          # Modelos de Datos (ORM)
 ├── routers/         # Enrutadores Modulares (Endpoints)
 ├── schemas/         # Esquemas Pydantic (Validación)
 ├── services/        # Lógica de Negocio
 ├── utils/           # Utilidades generales
 ├── main.py          # Punto de entrada de la aplicación
 └── requirements.txt # Dependencias

 /frontend
 ├── src/
 │   ├── assets/      # Archivos multimedia
 │   ├── components/  # Componentes React reutilizables
 │   ├── pages/       # Páginas principales
 │   ├── utils/       # Funciones de utilidad
 │   ├── App.jsx      # Componente raíz
 │   └── main.jsx     # Punto de entrada React

 
