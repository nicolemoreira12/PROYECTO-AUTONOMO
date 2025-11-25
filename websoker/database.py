"""Manejador de bases de datos"""
from typing import Optional, List, Dict, Any
from psycopg2.extras import RealDictCursor
from config import get_db_connection
from utils import convert_to_json_compatible


class DatabaseManager:
    """Gestor de operaciones de base de datos"""
    
    def __init__(self):
        self.connection = None
        self.last_product_id = 0
    
    def connect(self) -> bool:
        """Conecta a la base de datos"""
        try:
            self.connection = get_db_connection()
            self._initialize_last_product_id()
            print("Conexion a BD establecida")
            return True
        except Exception as e:
            print(f"Error conectando a BD: {e}")
            return False
    
    def _initialize_last_product_id(self) -> None:
        """Inicializa el último ID de producto visto"""
        try:
            cur = self.connection.cursor()
            cur.execute('SELECT MAX("idProducto") FROM producto')
            result = cur.fetchone()
            self.last_product_id = int(result[0]) if result[0] else 0
            print(f"Ultimo ID de producto: {self.last_product_id}")
        except Exception as e:
            print(f"Error inicializando last_product_id: {e}")
    
    def get_all_products(self) -> Optional[List[Dict[str, Any]]]:
        """Obtiene todos los productos"""
        try:
            if not self.connection:
                return None
            
            cur = self.connection.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT * FROM producto ORDER BY "idProducto"')
            products = cur.fetchall()
            return [convert_to_json_compatible(dict(row)) for row in products]
        except Exception as e:
            print(f"Error obteniendo productos: {e}")
            if self.connection:
                self.connection.rollback()
            return None
    
    def get_new_products(self) -> Optional[List[Dict[str, Any]]]:
        """Obtiene productos nuevos desde el último ID visto"""
        try:
            if not self.connection:
                return None
            
            cur = self.connection.cursor(cursor_factory=RealDictCursor)
            cur.execute(
                'SELECT * FROM producto WHERE "idProducto" > %s ORDER BY "idProducto"',
                (self.last_product_id,)
            )
            products = cur.fetchall()
            
            if products:
                result = [convert_to_json_compatible(dict(row)) for row in products]
                # Actualizar último ID
                new_ids = [p.get('idProducto') for p in result]
                self.last_product_id = max(new_ids) if new_ids else self.last_product_id
                return result
            
            return []
        except Exception as e:
            print(f"Error obteniendo productos nuevos: {e}")
            if self.connection:
                self.connection.rollback()
            return None
    
    def create_product(self, product_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Crea un nuevo producto"""
        try:
            if not self.connection:
                return None
            
            # Asignar valores por defecto
            if 'imagenURL' not in product_data:
                product_data['imagenURL'] = ''
            if 'stock' not in product_data:
                product_data['stock'] = 1
            
            cur = self.connection.cursor(cursor_factory=RealDictCursor)
            
            # Construir SQL dinámico
            columns = ', '.join(f'"{k}"' for k in product_data.keys())
            placeholders = ', '.join(['%s'] * len(product_data))
            sql = f'INSERT INTO producto ({columns}) VALUES ({placeholders}) RETURNING *'
            
            cur.execute(sql, tuple(product_data.values()))
            self.connection.commit()
            
            result = cur.fetchone()
            if result:
                return convert_to_json_compatible(dict(result))
            return None
        except Exception as e:
            print(f"Error creando producto: {e}")
            if self.connection:
                self.connection.rollback()
            return None
    
    def close(self) -> None:
        """Cierra la conexión a BD"""
        if self.connection:
            try:
                self.connection.close()
                print("Conexion a BD cerrada")
            except Exception as e:
                print(f"Error cerrando conexion: {e}")
