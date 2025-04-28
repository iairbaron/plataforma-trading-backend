# Ejemplos de uso de la API (curl)

A continuación se muestran ejemplos de requests y respuestas para los endpoints principales de la plataforma.

---

## 1. Registro de usuario
```bash
curl -X POST http://localhost:3000/trading/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test123"}'
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@test.com",
      "role": "USER"
    }
  }
}
```

---

## 2. Login
```bash
curl -X POST http://localhost:3000/trading/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123"}'
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@test.com",
      "role": "USER"
    }
  }
}
```

---

## 3. Consultar balance
```bash
curl -X GET http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer <jwt_token>"
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "data": {
    "usdBalance": "1000.00",
    "totalCoinValue": "0.00",
    "coinDetails": {}
  }
}
```

---

## 4. Crear orden de compra
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"btc","amount":0.1,"type":"buy"}'
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "userId": "...",
    "symbol": "btc",
    "type": "buy",
    "amount": "0.1",
    "priceAtExecution": "65000.00"
  }
}
```

---

## 5. Agregar favorito
```bash
curl -X POST http://localhost:3000/api/favorites \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"btc"}'
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "symbol": "btc",
    "userId": "..."
  }
}
```

---

## 6. Eliminar favorito
```bash
curl -X DELETE http://localhost:3000/api/favorites/btc \
  -H "Authorization: Bearer <jwt_token>"
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Favorite removed successfully"
}
```

---

## 7. Depositar fondos
```bash
curl -X POST http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"operation":"deposit","amount":500}'
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "userId": "...",
    "balance": "1500.00"
  }
}
```

---

## 8. Retirar fondos
```bash
curl -X POST http://localhost:3000/api/wallet/balance \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"operation":"withdraw","amount":200}'
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "userId": "...",
    "balance": "1300.00"
  }
}
```

---

## 9. Crear orden de venta
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"btc","amount":0.05,"type":"sell"}'
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "userId": "...",
    "symbol": "btc",
    "type": "sell",
    "amount": "0.05",
    "priceAtExecution": "65000.00"
  }
}
```

---

## 10. Listar órdenes
```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer <jwt_token>"
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "...",
      "userId": "...",
      "symbol": "btc",
      "type": "buy",
      "amount": "0.1",
      "priceAtExecution": "65000.00"
    },
    {
      "id": "...",
      "userId": "...",
      "symbol": "btc",
      "type": "sell",
      "amount": "0.05",
      "priceAtExecution": "65000.00"
    }
  ]
}
```

---

## 11. Listar favoritos
```bash
curl -X GET http://localhost:3000/api/favorites \
  -H "Authorization: Bearer <jwt_token>"
```
**Respuesta esperada:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "...",
      "symbol": "btc",
      "userId": "..."
    }
  ]
}
```

---

## 12. Listar instrumentos de mercado
```bash
curl -X GET http://localhost:3000/api/market/instruments \
  -H "Authorization: Bearer <jwt_token>"
```
**Respuesta esperada:**
```json
{
  "coins": [
    {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "btc",
      "price": 65000,
      "high24h": 66000,
      "low24h": 64000,
      "volume24h": 100000000,
      "change24h": 2.5,
      "change7d": 5.0
    },
    // ... otras monedas
  ]
}
```

---

> Reemplaza `<jwt_token>` por el token obtenido en el registro o login. 