import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { httpClient } from '@infrastructure/api';
import './EmprendedorPage.css';

interface ProductoEmprendedor {
    id: number;
    nombre: string;
    precio: number;
    stock: number;
    categoria?: { nombre: string };
    imagenUrl?: string;
}

interface EstadisticasEmprendedor {
    totalProductos: number;
    totalVentas: number;
    ingresosTotal: number;
    productosActivos: number;
}

export const EmprendedorPage: React.FC = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'productos' | 'ventas' | 'agregar'>('dashboard');
    const [productos, setProductos] = useState<ProductoEmprendedor[]>([]);
    const [estadisticas, setEstadisticas] = useState<EstadisticasEmprendedor>({
        totalProductos: 0,
        totalVentas: 0,
        ingresosTotal: 0,
        productosActivos: 0
    });
    const [loading, setLoading] = useState(false);

    // Formulario para nuevo producto
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        descripcion: '',
        precio: '' as any,
        stock: '' as any,
        categoriaId: 1,
        imagenUrl: ''
    });

    useEffect(() => {
        cargarDatosEmprendedor();
    }, []);

    const cargarDatosEmprendedor = async () => {
        setLoading(true);
        try {
            // Cargar productos del emprendedor
            const productosResponse = await httpClient.get<any>('/productos');

            // Filtrar solo productos del emprendedor actual si existe la relación
            const misProductos = productosResponse.filter((p: any) =>
                p.emprendedor?.usuarioId === user?.id || p.usuario?.id === user?.id
            );

            // Mapear imagen para asegurar compatibilidad
            const productosMapeados = misProductos.map((p: any) => ({
                ...p,
                imagen: p.imagen || p.imagenUrl || '',
                imagenUrl: p.imagen || p.imagenUrl || ''
            }));

            setProductos(productosMapeados);

            // Calcular estadísticas
            const stats = {
                totalProductos: productosMapeados.length,
                productosActivos: productosMapeados.filter((p: any) => p.stock > 0).length,
                totalVentas: 0, // Se puede calcular desde órdenes
                ingresosTotal: 0 // Se puede calcular desde órdenes
            };
            setEstadisticas(stats);

        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAgregarProducto = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Buscar o crear emprendedor para este usuario
            let emprendedorId: number | undefined;

            try {
                // Intentar obtener el emprendedor del usuario
                const emprendedoresResponse = await httpClient.get<any[]>('/emprendedores');
                const miEmprendedor = emprendedoresResponse.find((e: any) =>
                    e.usuarioId === user?.id || e.usuario?.idUsuario === user?.id
                );

                if (miEmprendedor) {
                    emprendedorId = miEmprendedor.idEmprendedor;
                } else {
                    // Crear nuevo emprendedor
                    const nuevoEmprendedor = await httpClient.post('/emprendedores', {
                        nombreTienda: `Tienda de ${user?.nombre}`,
                        descripcionTienda: 'Mi tienda personal',
                        rating: 5.0,
                        usuarioId: user?.id
                    });
                    emprendedorId = nuevoEmprendedor.idEmprendedor;
                    console.log('✅ Emprendedor creado:', emprendedorId);
                }
            } catch (error) {
                console.warn('⚠️ No se pudo verificar/crear emprendedor:', error);
            }

            // Crear el producto con los datos correctos
            const productoData = {
                nombre: nuevoProducto.nombre,
                nombreProducto: nuevoProducto.nombre, // Backend usa nombreProducto
                descripcion: nuevoProducto.descripcion,
                precio: parseFloat(nuevoProducto.precio.toString()),
                stock: parseInt(nuevoProducto.stock.toString()),
                categoriaId: nuevoProducto.categoriaId,
                emprendedorId: emprendedorId,
                imagen: nuevoProducto.imagenUrl || 'https://via.placeholder.com/50'
            };

            console.log('📦 Enviando producto:', productoData);

            await httpClient.post('/productos', productoData);

            alert('✅ Producto agregado exitosamente!');

            // Limpiar formulario
            setNuevoProducto({
                nombre: '',
                descripcion: '',
                precio: '' as any,
                stock: '' as any,
                categoriaId: 1,
                imagenUrl: ''
            });

            // Recargar productos
            cargarDatosEmprendedor();
            setActiveTab('productos');

        } catch (error: any) {
            console.error('Error al agregar producto:', error);
            alert('❌ Error al agregar producto: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarProducto = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await httpClient.delete(`/productos/${id}`);
            alert('✅ Producto eliminado');
            cargarDatosEmprendedor();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('❌ Error al eliminar producto');
        }
    };

    return (
        <div className="emprendedor-page">
            <div className="emprendedor-header">
                <h1>🏪 Panel de Emprendedor</h1>
                <p>Bienvenido, <strong>{user?.nombre}</strong></p>
            </div>

            <div className="emprendedor-tabs">
                <button
                    className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button
                    className={`tab ${activeTab === 'productos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('productos')}
                >
                    📦 Mis Productos
                </button>
                <button
                    className={`tab ${activeTab === 'agregar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('agregar')}
                >
                    ➕ Agregar Producto
                </button>
                <button
                    className={`tab ${activeTab === 'ventas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ventas')}
                >
                    💰 Ventas
                </button>
            </div>

            <div className="emprendedor-content">
                {/* DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="dashboard-section">
                        <h2>📊 Estadísticas de tu Negocio</h2>
                        <div className="stats-grid-emprendedor">
                            <div className="stat-card-emprendedor">
                                <div className="stat-icon">📦</div>
                                <div className="stat-info">
                                    <h3>{estadisticas.totalProductos}</h3>
                                    <p>Productos Totales</p>
                                </div>
                            </div>
                            <div className="stat-card-emprendedor">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <h3>{estadisticas.productosActivos}</h3>
                                    <p>Productos con Stock</p>
                                </div>
                            </div>
                            <div className="stat-card-emprendedor">
                                <div className="stat-icon">🛒</div>
                                <div className="stat-info">
                                    <h3>{estadisticas.totalVentas}</h3>
                                    <p>Ventas Realizadas</p>
                                </div>
                            </div>
                            <div className="stat-card-emprendedor">
                                <div className="stat-icon">💵</div>
                                <div className="stat-info">
                                    <h3>${estadisticas.ingresosTotal.toFixed(2)}</h3>
                                    <p>Ingresos Totales</p>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-tips">
                            <h3>💡 Consejos para tu Negocio</h3>
                            <ul>
                                <li>✨ Mantén tus productos con stock actualizado</li>
                                <li>📸 Agrega imágenes atractivas a tus productos</li>
                                <li>💰 Establece precios competitivos</li>
                                <li>📝 Usa descripciones claras y detalladas</li>
                                <li>⭐ Responde rápido a tus clientes</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* MIS PRODUCTOS */}
                {activeTab === 'productos' && (
                    <div className="productos-section">
                        <h2>📦 Mis Productos ({productos.length})</h2>

                        {loading ? (
                            <div className="loading-center">
                                <div className="spinner"></div>
                                <p>Cargando productos...</p>
                            </div>
                        ) : productos.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📦</div>
                                <h3>No tienes productos aún</h3>
                                <p>Comienza agregando tu primer producto</p>
                                <button
                                    className="btn-primary"
                                    onClick={() => setActiveTab('agregar')}
                                >
                                    ➕ Agregar Producto
                                </button>
                            </div>
                        ) : (
                            <div className="productos-table-container">
                                <table className="productos-table">
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Nombre</th>
                                            <th>Categoría</th>
                                            <th>Precio</th>
                                            <th>Stock</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos.map((producto) => (
                                            <tr key={producto.id}>
                                                <td>
                                                    <img
                                                        src={producto.imagen || producto.imagenUrl || 'https://via.placeholder.com/50'}
                                                        alt={producto.nombre}
                                                        className="producto-img-small"
                                                    />
                                                </td>
                                                <td><strong>{producto.nombre}</strong></td>
                                                <td>{producto.categoria?.nombre || 'Sin categoría'}</td>
                                                <td>${typeof producto.precio === 'number' ? producto.precio.toFixed(2) : parseFloat(producto.precio).toFixed(2)}</td>
                                                <td>{producto.stock}</td>
                                                <td>
                                                    <span className={`badge ${producto.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                                                        {producto.stock > 0 ? 'Disponible' : 'Sin stock'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn-icon btn-danger"
                                                        onClick={() => handleEliminarProducto(producto.idProducto ?? producto.id)}
                                                        title="Eliminar"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* AGREGAR PRODUCTO */}
                {activeTab === 'agregar' && (
                    <div className="agregar-section">
                        <h2>➕ Agregar Nuevo Producto</h2>

                        <form onSubmit={handleAgregarProducto} className="producto-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nombre del Producto *</label>
                                    <input
                                        type="text"
                                        value={nuevoProducto.nombre}
                                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                                        placeholder="Ej: Laptop HP 15"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Categoría *</label>
                                    <select
                                        value={nuevoProducto.categoriaId}
                                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoriaId: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value={1}>Electrónica</option>
                                        <option value={2}>Ropa</option>
                                        <option value={3}>Alimentos</option>
                                        <option value={4}>Hogar</option>
                                        <option value={5}>Deportes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descripción *</label>
                                <textarea
                                    value={nuevoProducto.descripcion}
                                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                                    placeholder="Describe tu producto..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Precio (USD) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={nuevoProducto.precio}
                                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: parseFloat(e.target.value) })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Stock Inicial *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={nuevoProducto.stock}
                                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: parseInt(e.target.value) })}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>URL de Imagen (opcional)</label>
                                <input
                                    type="url"
                                    value={nuevoProducto.imagenUrl}
                                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagenUrl: e.target.value })}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                                {nuevoProducto.imagenUrl && (
                                    <img
                                        src={nuevoProducto.imagenUrl}
                                        alt="Preview"
                                        className="image-preview"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200' }}
                                    />
                                )}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn-primary btn-large"
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Guardando...' : '✅ Guardar Producto'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setActiveTab('productos')}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* VENTAS */}
                {activeTab === 'ventas' && (
                    <div className="ventas-section">
                        <h2>💰 Historial de Ventas</h2>
                        <div className="info-box">
                            <p>🚧 Sección en desarrollo</p>
                            <p>Aquí podrás ver el historial de ventas de tus productos</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
