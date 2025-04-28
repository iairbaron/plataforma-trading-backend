# Plataforma Trading Backend (README Draft)

## Requisitos del sistema
- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL (o SQLite para desarrollo/pruebas)
- Sistema operativo: Linux, macOS o Windows

## Instalación de PostgreSQL

### Linux (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

### macOS (Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

### Windows
- Descarga el instalador desde: https://www.postgresql.org/download/windows/
- Sigue el asistente y recuerda el usuario/contraseña que configures.


**Recuerda:**
- Crea una base de datos y usuario para tu app, o usa los valores por defecto en tu `.env`.
- Puedes conectarte con herramientas como `psql`, DBeaver, TablePlus, etc.

## Instalación
1. Clona el repositorio:
   ```bash
   git clone <REPO_URL>
   cd <REPO_DIR>
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   - Copia `.env.example` a `.env` y ajusta los valores según tu entorno (DB, JWT_SECRET, etc).

4. Ejecuta las migraciones de la base de datos:
   ```bash
   npx prisma migrate dev --name init
   ```


## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/tu_base_de_datos"  # URL de conexión a la base de datos
PORT=3000                              # Puerto donde corre la API
JWT_SECRET="tu_clave_secreta"         # Clave secreta para firmar JWT
COINGECKO_API_KEY="Hd6BYkuPjHa49hLZLCSpeLxZ"
```

   ```

## Ejecución

  ```bash
  npm run dev
  ```
- Para correr los tests:
  ```bash
  npm test
  ```

## Descripción de la solución
Este backend implementa una API REST para una plataforma de trading de criptomonedas. Permite:
- Registro y autenticación de usuarios (JWT)
- Gestión de órdenes de compra/venta
- Consulta de balances y activos
- Favoritos de monedas
- Validaciones y manejo de errores robusto
- Cobertura de tests de integración y unitarios

## Tareas automáticas (cron)

El backend ejecuta una tarea automática cada 5 minutos (usando node-cron) que sincroniza los datos de las principales criptomonedas desde CoinGecko. Al iniciar la app también se sincronizan los datos.

Los datos sincronizados incluyen:
- id, name, symbol
- price (precio actual)
- high24h, low24h (máximos/mínimos 24h)
- volume24h (volumen 24h)
- change24h, change7d (variación % 24h y 7d)

Esto permite que las órdenes y los balances se calculen con precios actualizados.

## Autenticación y login

El login y el registro (`/trading/auth/login` y `/trading/auth/signup`) devuelven un token JWT que debe ser enviado en el header `Authorization` para acceder a rutas protegidas.

El token contiene:
- id: ID del usuario
- email: Email del usuario
- role: Rol del usuario (por defecto, "USER")
- Expira en 24 horas

El backend valida el token en cada request protegida y asocia el usuario autenticado a `req.user`.

## Guía de uso básico
- **Registro:** `POST /trading/auth/signup`
- **Login:** `POST /trading/auth/login`
- **Consultar balance:** `GET /api/wallet/balance` (requiere token)
- **Depositar/retirar fondos:** `POST /api/wallet/balance` (requiere token)
- **Crear orden:** `POST /api/orders` (requiere token)
- **Ver órdenes:** `GET /api/orders` (requiere token)
- **Agregar favorito:** `POST /api/favorites` (requiere token)
- **Eliminar favorito:** `DELETE /api/favorites/:symbol` (requiere token)

Para todas las rutas protegidas, agrega el header:
```
Authorization: Bearer <token>
```

## ---------------------------------------------- Decisiones técnicas y trade-offs ----------------------------------------------
- **Persistencia de balances de monedas:**
  - El balance de cada moneda se calcula en tiempo real sumando compras y restando ventas, en vez de mantener un campo persistente. Esto simplifica la lógica y evita inconsistencias, pero puede ser menos eficiente para usuarios con muchas transacciones.
- **Validación y manejo de errores:**
  - Se usan middlewares y helpers para validar entradas y devolver errores estructurados. Esto mejora la mantenibilidad y la experiencia de desarrollo.
- **Tests de integración:**
  - Los tests usan el flujo real de signup/login para simular usuarios reales, asegurando que la autenticación y la lógica de negocio funcionen de extremo a extremo.
- **Tecnologías:**
  - Express, Prisma ORM, JWT, Jest, Supertest.
- **Trade-off:**
  - Se priorizó la claridad y mantenibilidad del código sobre la optimización prematura. El sistema es fácilmente extensible para agregar nuevos activos o funcionalidades.
- **Proveedor de datos de mercado:**
  - Se utiliza CoinGecko para obtener precios y datos de criptomonedas porque Alpha Vantage presentaba errores de límite de peticiones (rate limit) incluso en pruebas básicas. CoinGecko permite mayor volumen de consultas gratuitas y es más estable para este caso de uso.

## Estructura del proyecto

- `src/controllers/` — Lógica de negocio y endpoints principales (auth, órdenes, wallet, favoritos, mercado)
- `src/routes/` — Definición de rutas de la API
- `src/middleware/` — Middlewares de validación, autenticación y manejo de errores
- `src/utils/` — Helpers reutilizables (validaciones, formateo, helpers de wallet)
- `src/services/` — Integración con servicios externos (CoinGecko, usuarios)
- `src/sdk/` — Lógica de sincronización y cacheo de monedas (ver más abajo)
- `src/cron/` — Tareas programadas (sincronización periódica de monedas)
- `src/types/` — Tipos e interfaces TypeScript
- `src/__tests__/` — Tests de integración y unitarios

## SDK y cache de monedas

El archivo `src/sdk/coin.ts` implementa una clase singleton que:
- Sincroniza y cachea los datos de las principales criptomonedas usando CoinGecko.
- Permite acceder rápidamente a los datos de monedas en memoria sin hacer una consulta externa en cada request.
- Es utilizado por los controladores y middlewares para obtener precios y validar símbolos.

## Validaciones y manejo de errores

- Todas las rutas de autenticación y órdenes usan middlewares para validar campos requeridos, formatos y reglas de negocio.
- Los errores se devuelven con un formato consistente:
  ```json
  {
    "status": "error",
    "code": "INVALID_AMOUNT",
    "errors": [
      { "message": "La cantidad debe ser mayor que cero" }
    ]
  }
  ```
- Esto facilita el manejo de errores en el frontend y la depuración.

## Helpers y lógica de negocio

- Helpers en `src/utils/walletHelpers.ts` centralizan la validación de montos, existencia de wallets, verificación de fondos y activos antes de permitir compras/ventas.
- Esto evita duplicación de código y asegura reglas de negocio consistentes en toda la API.

## Cobertura de tests

El proyecto incluye tests de integración y unitarios para los principales flujos de negocio, usando Jest y Supertest. Se cubren:
- Autenticación
- Órdenes de compra/venta
- Wallet y balance
- Favoritos
- Validaciones y errores

## Seguridad

- Las rutas protegidas requieren JWT.
- Las contraseñas se almacenan hasheadas con bcrypt.
- El sistema valida roles y existencia de usuario en cada request autenticada.

---

