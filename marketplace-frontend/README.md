# Marketplace Frontend

Frontend desarrollado con React, TypeScript y Clean Architecture.

## 🏗️ Arquitectura

Este proyecto sigue los principios de Clean Architecture, dividiendo el código en capas claramente definidas:

```
src/
├── domain/              # Capa de Dominio (Entidades y Reglas de Negocio)
│   ├── entities/        # Entidades del dominio
│   ├── repositories/    # Interfaces de repositorios
│   └── value-objects/   # Objetos de valor
├── application/         # Capa de Aplicación (Casos de Uso)
│   └── use-cases/       # Casos de uso de la aplicación
├── infrastructure/      # Capa de Infraestructura (Implementaciones)
│   ├── api/            # Cliente HTTP y configuración
│   ├── repositories/   # Implementaciones de repositorios
│   └── services/       # Servicios externos
└── presentation/        # Capa de Presentación (UI)
    ├── components/     # Componentes React
    ├── pages/          # Páginas de la aplicación
    ├── hooks/          # Custom hooks
    ├── contexts/       # Context API
    └── store/          # Estado global (Zustand)
```

## 🚀 Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Zustand** - Gestión de estado

## 📦 Instalación

```bash
npm install
```

## 🏃‍♂️ Desarrollo

```bash
npm run dev
```

## 🔨 Build

```bash
npm run build
```

## 📝 Principios de Clean Architecture

1. **Independencia de Frameworks**: El código de negocio no depende de frameworks externos
2. **Testeable**: La lógica de negocio puede ser testeada sin UI, BD, o servicios externos
3. **Independencia de UI**: La UI puede cambiar sin afectar el resto del sistema
4. **Independencia de BD**: Puedes cambiar de BD sin afectar las reglas de negocio
5. **Independencia de Servicios Externos**: Las reglas de negocio no conocen el mundo exterior

## 🔄 Flujo de Datos

```
Presentation → Application → Infrastructure
     ↓              ↓              ↓
  UI/UX       Use Cases      API/Services
     ↑              ↑              ↑
  Domain    ←    Domain    ←    Domain
```
