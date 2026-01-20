# ⚡ INICIO RÁPIDO

## 🎯 Para Ver Productos del Backend Real

### 1️⃣ Terminal 1 - Inicia el Backend

```powershell
cd Markplace
npm run dev
```

Espera a ver: `✅ Servidor funcionando en puerto 3000`

### 2️⃣ Terminal 2 - Inicia el Frontend

```powershell
cd marketplace-frontend
npm run dev
```

Espera a ver: `➜ Local: http://localhost:5173/`

### 3️⃣ Abre el Navegador

```
http://localhost:5173
```

**¡Eso es todo!** Los productos de tu base de datos se mostrarán automáticamente.

---

## ✅ Cambios Realizados

Tu frontend **YA ESTÁ CONECTADO** al backend de Markplace:

- ✅ **HomePage:** Muestra productos reales de la BD
- ✅ **ProductoDetallePage:** Obtiene detalles reales de la BD  
- ✅ **Búsqueda:** Busca en la BD real
- ✅ **Categorías:** Vienen de la BD real
- ✅ **Carrito:** Se guarda en el backend (si estás autenticado)

---

## ⚠️ Si No Ves Productos

1. **Verifica el backend:**
   ```powershell
   .\TEST-CONNECTION.ps1
   ```

2. **Agrega productos:**
   - Inicia sesión como emprendedor
   - Ve a `/emprendedor`
   - Agrega productos desde la interfaz

3. **Revisa la consola:**
   - Presiona `F12` en el navegador
   - Ve a la pestaña "Console"
   - Busca errores

---

## 📚 Documentación Completa

Lee [CONEXION-BACKEND.md](CONEXION-BACKEND.md) para detalles técnicos completos.

---

## 🎉 ¡Listo!

Todo está configurado. Solo ejecuta `.\START-MARKETPLACE.ps1` y disfruta de tu marketplace con datos reales.
