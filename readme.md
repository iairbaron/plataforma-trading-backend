## Endpoints

### Autenticación

- **Login:** `/api/auth/login`
- **Signup:** `/api/auth/signup`

### Instruments

**URL:** `/api/market/instruments`

**Método:** `GET`

**Descripción:** Devuelve una lista de criptomonedas con sus precios actuales y variaciones diarias.

**Autenticación:** Requiere un token JWT en el header de autorización.

**Header de Autorización:**
```plaintext
Authorization: Bearer <tu_token_jwt>
```

**Respuesta Exitosa:**

- **Código:** `200 OK`
- **Cuerpo:**
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
      },
      {
        "id": "ethereum",
        "name": "Ethereum",
        "symbol": "eth",
        "price": 1573.53,
        "high24h": 1620.2,
        "low24h": 1570.08,
        "volume24h": 6687848117,
        "change24h": -2.0226,
        "change7d": -0.6744
      }
      // ... más monedas
    ]
  }
  ```

**Notas:**
- `id`: Identificador de la criptomoneda
- `name`: Nombre de la criptomoneda
- `symbol`: Símbolo de la criptomoneda
- `price`: Precio actual en USD
- `high24h`: Precio más alto en las últimas 24 horas
- `low24h`: Precio más bajo en las últimas 24 horas
- `volume24h`: Volumen de transacciones en las últimas 24 horas
- `change24h`: Variación porcentual en las últimas 24 horas
- `change7d`: Variación porcentual en los últimos 7 días
