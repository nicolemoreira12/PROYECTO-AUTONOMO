"""Utilidades para manejo de datos"""
import json
from decimal import Decimal
from typing import Any, Dict, Tuple, Optional


def convert_to_json_compatible(obj: Any) -> Any:
    """Convierte objetos no serializables a tipos JSON compatibles"""
    if isinstance(obj, dict):
        return {k: convert_to_json_compatible(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_to_json_compatible(item) for item in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj


def parse_message(raw: str) -> Tuple[bool, Optional[Dict]]:
    """
    Parsea un mensaje JSON. Si falla, intenta repararlo.
    Retorna: (éxito, datos_parseados)
    """
    if not raw or not isinstance(raw, str):
        return False, None
    
    raw = raw.strip()
    
    # Intento 1: JSON válido
    try:
        return True, json.loads(raw)
    except json.JSONDecodeError:
        pass
    
    # Intento 2: Reparar JSONs malformados
    repaired = raw
    
    # Balancear llaves
    opens = repaired.count('{')
    closes = repaired.count('}')
    if opens > closes:
        repaired += '}' * (opens - closes)
    
    try:
        return True, json.loads(repaired)
    except json.JSONDecodeError:
        return False, None


def normalize_product(product: Dict[str, Any]) -> Dict[str, Any]:
    """Normaliza los campos del producto al formato de BD"""
    if not isinstance(product, dict):
        return {}
    
    mapping = {
        'nombre': 'nombreProducto',
        'nombreproducto': 'nombreProducto',
        'descripcion': 'descripcion',
        'precio': 'precio',
        'stock': 'stock',
        'imagenurl': 'imagenURL',
        'emprendedoridemrendedor': 'emprendedorIdEmprendedor',
        'categoriaidcategoria': 'categoriaIdCategoria'
    }
    
    normalized = {}
    for key, value in product.items():
        key_lower = str(key).lower()
        mapped_key = mapping.get(key_lower, key)
        normalized[mapped_key] = value
    
    return normalized
