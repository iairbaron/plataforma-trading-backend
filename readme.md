# Plataforma Trading Backend

API para la plataforma de trading que proporciona endpoints para autenticación, datos de mercado y gestión de favoritos.

## Configuración

Asegúrate de tener un archivo `.env` con las siguientes variables:

```plaintext
DATABASE_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/tu_base_de_datos"
PORT=3000
JWT_SECRET="tu_clave_secreta"
COINGECKO_API_KEY="tu_api_key_coingecko"
```

## Endpoints

### Autenticación

#### Login
- **URL:** `/trading/auth/login`
- **Método:** `POST`
- **Body:**
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }
  ```
- **Respuesta Exitosa:**
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": "user_id",
        "name": "Nombre Usuario",
        "email": "usuario@ejemplo.com",
        "role": "user"
      }
    }
  }
  ```

### Instrumentos (Criptomonedas)

#### Obtener Lista de Instrumentos
- **URL:** `/api/market/instruments`
- **Método:** `GET`
- **Headers:** 
  ```
  Authorization: Bearer <token_jwt>
  ```
- **Respuesta Exitosa:**
  ```json
  {
    "coins": [
      {
        "id": "bitcoin",
        "name": "Bitcoin",
        "symbol": "btc",
        "price": 84353,
        "high24h": 85320,
        "low24h": 84038,
        "volume24h": 11975620754,
        "change24h": -1.0139,
        "change7d": 0.3828
      }
    ]
  }
  ```

### Favoritos

#### Agregar Favorito
- **URL:** `/api/favorites`
- **Método:** `POST`
- **Headers:**
  ```
  Authorization: Bearer <token_jwt>
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "symbol": "btc"
  }
  ```
- **Respuesta Exitosa:**
  ```json
  {
    "status": "success",
    "data": {
      "id": "uuid",
      "symbol": "btc",
      "userId": "user_id",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### Obtener Favoritos
- **URL:** `/api/favorites`
- **Método:** `GET`
- **Headers:**
  ```
  Authorization: Bearer <token_jwt>
  ```
- **Respuesta Exitosa:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "uuid",
        "symbol": "btc",
        "userId": "user_id",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### Eliminar Favorito
- **URL:** `/api/favorites/:symbol`
- **Método:** `DELETE`
- **Headers:**
  ```
  Authorization: Bearer <token_jwt>
  ```
- **Respuesta Exitosa:**
  ```json
  {
    "status": "success",
    "message": "Favorite removed successfully"
  }
  ```

## Ejecución

Para iniciar el servidor:

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

## Notas
- Todos los endpoints (excepto login) requieren autenticación mediante token JWT
- El token JWT debe enviarse en el header `Authorization` como `Bearer <token>`
- Los precios de las criptomonedas se actualizan cada 5 minutos
