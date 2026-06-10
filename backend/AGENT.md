# AGENT.md - PLAN DE EJECUCIÓN PASO A PASO Y DIRECTRICES DE DESARROLLO
## SISTEMA: API REST del Repositorio Digital Institucional - UNEFA Núcleo Táchira

Este documento contiene las especificaciones exactas, la arquitectura de archivos y la ruta de desarrollo obligatoria para la construcción de la API. Sigue cada fase de manera secuencial. No avances al siguiente hito hasta consolidar y probar el actual.

---

## REGLAS DE DESARROLLO (AI GUARDRAILS)
1. **Express 5 Native Async:** Express 5 gestiona las promesas rechazadas automáticamente. No envuelvas las rutas en wrappers redundantes; los errores lanzados con `throw` en funciones async irán directo al middleware global de errores.
2. **Uso Estricto del ORM:** Prohibidas las consultas SQL crudas en strings. Todo se maneja vía modelos y transacciones de Sequelize.
3. **Flujo de Validación Estricto:**
   - **Capa Router:** Filtra tipos de datos y estructuras básicas mediante `express-validator`.
   - **Capa Service:** Ejecuta validaciones profundas de metadatos variables (JSONB) mediante esquemas de `Joi` antes de tocar la base de datos.
4. **Respuesta Unificada:** Todas las respuestas de error deben usar la estructura del middleware global de manejo de errores.

---

## FASE 1: CONFIGURACIÓN DEL ENTORNO E INFRAESTRUCTURA BASE

### 1.1 Inicialización de Dependencias
Instala los siguientes paquetes exactos en sus versiones estables compatibles con Express 5:
```bash
npm init -y
npm install express@5.0.0 sequelize pg pg-hstore dotenv cors helmet morgan bcryptjs jsonwebtoken express-validator joi
npm install --save-dev nodemon sequelize-cli
```

### 1.2 Estructura de Carpetas
Organiza el proyecto con la siguiente arquitectura de archivos:

unefa-backend/
├── config/
│   ├── database.js
│   └── environment.js
├── src/
│   ├── app.js
│   ├── controllers/
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── role.middleware.js
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── validators/
├── database/
│   ├── migrations/
│   └── seeders/
├── .env
├── .env.example
└── package.json

### 1.3 Configuración de la Base de Datos
Crea el archivo `config/database.js` con la configuración de Sequelize para PostgreSQL, utilizando variables de entorno para la conexión.