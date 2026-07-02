/**
 * Tipos para el Tracker de Ofertas
 */

export interface Oferta {
  tienda: string;
  nombre: string;
  precio_original: number;
  precio_oferta: number;
  descuento: number;
  link: string;
  imagen?: string;
  talles?: string[];
  categoria?: string;
  subcategoria?: string;
  genero?: string;
}

export type Categoria = 
  | 'Todas'
  | 'Electrodomésticos'
  | 'Ropa'
  | 'Electrónica'
  | 'Juguetes'
  | 'Muebles'
  | 'Hogar'
  | 'Deportes'
  | 'Otros';

export type SubcategoriaRopa = 
  | 'Todas'
  | 'Camisas'
  | 'Remeras'
  | 'Shorts'
  | 'Pantalones'
  | 'Zapatillas'
  | 'Accesorios'
  | 'Buzos';

export type SizeTalle = 
  | 'Todas'
  | 'XXS'
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | 'XXL';

export const CATEGORIAS: Record<Categoria, string> = {
  'Todas': '📦 Todas las categorías',
  'Electrodomésticos': '🔌 Electrodomésticos',
  'Ropa': '👕 Ropa',
  'Electrónica': '📱 Electrónica',
  'Juguetes': '🎮 Juguetes',
  'Muebles': '🪑 Muebles',
  'Hogar': '🏠 Hogar',
  'Deportes': '⚽ Deportes',
  'Otros': '📦 Otros',
};

export const SUBCATEGORIAS_ROPA: Record<SubcategoriaRopa, string> = {
  'Todas': '📦 Todas las prendas',
  'Camisas': '👔 Camisas',
  'Remeras': '👕 Remeras',
  'Shorts': '🩳 Shorts',
  'Pantalones': '👖 Pantalones',
  'Zapatillas': '👟 Zapatillas',
  'Accesorios': '🧢 Accesorios',
  'Buzos': '🧥 Buzos',
};

export type Genero =
  | 'Todas'
  | 'Hombre'
  | 'Mujer'
  | 'Unisex'
  | 'Niños';

export const GENEROS: Record<Genero, string> = {
  'Todas': '👫 Todos los géneros',
  'Hombre': '👨 Hombre',
  'Mujer': '👩 Mujer',
  'Unisex': '👫 Unisex',
  'Niños': '🧒 Niños',
};

export const SIZES_TALLE: Record<SizeTalle, string> = {
  'Todas': '📏 Todos los talles',
  'XXS': 'XXS',
  'XS': 'XS',
  'S': 'S',
  'M': 'M',
  'L': 'L',
  'XL': 'XL',
  'XXL': 'XXL',
};
