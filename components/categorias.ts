import type { Oferta, Categoria, SubcategoriaRopa, SizeTalle, Genero } from './types';

/**
 * Palabras clave para categorización de productos
 */
const CATEGORIA_KEYWORDS: Record<Categoria, string[]> = {
  'Electrodomésticos': ['tostadora', 'refrigerador', 'lavarropas', 'heladera', 'microondas', 'horno', 'licuadora', 'batidora', 'aspiradora', 'calefactor', 'aire', 'ventilador', 'plancha', 'secarropas', 'cava', 'alacena', 'cinta', 'caminadora', 'cocina', 'anafe', 'pava', 'termo', 'exprimidor', 'procesadora'],
  'Ropa': ['camisa', 'remera', 'short', 'pantalón', 'zapatilla', 'zapato', 'bota', 'sandalia', 'buzo', 'sudadera', 'chamarra', 'campera', 'chomba', 'pollera', 'falda', 'blusa', 'camiseta', 'medias', 'abrigo', 'saco', 'blazer', 'vestido', 'funda', 'parka', 'rompevientos', 'chaleco', 'traje', 'bikini', 'malla', 'deportivo', 'running', 'training', 'jogging', 'hoodie', 'musculosa', 'pijama', 'boxer', 'slip', 'bombacha', 'top', 'enterito', 'mono'],
  'Electrónica': ['celular', 'smartphone', 'tablet', 'laptop', 'computadora', 'cable', 'cargador', 'adaptador', 'auriculares', 'parlante', 'micrófono', 'monitor', 'teclado', 'mouse', 'webcam', 'samsung', 'iphone', 'galaxy', 'realme', 'motorola', 'poco', 'funda', 'protector', 'notebook', 'smartwatch', 'reloj', 'smartband', 'tv', 'televisor', 'led', 'hdmi', 'usb', 'disco', 'memoria', 'ssd'],
  'Juguetes': ['lego', 'toy', 'muñeca', 'auto', 'juego', 'rompecabezas', 'puzzle', 'peluche', 'figura', 'robot', 'consola', 'joystick', 'frozen', 'disney', 'barbie', 'hot wheels', 'playmobil', 'hasbro', 'matel', 'didáctico', 'bloques', 'cartas', 'tablero', 'mazo'],
  'Muebles': ['escritorio', 'silla', 'mesa', 'estante', 'biblioteca', 'aparador', 'ropero', 'armario', 'cama', 'sommier', 'colchón', 'sofá', 'sillón', 'banco', 'estantería', 'cajonera', 'cómoda', 'velador', 'mueble', 'placard', 'modular', 'rack'],
  'Hogar': ['almohada', 'sábana', 'toalla', 'cortina', 'espejo', 'lámpara', 'vela', 'frazada', 'manta', 'sombrilla', 'paragüas', 'escoba', 'recogedor', 'balde', 'servilleta', 'mantel', 'acolchado', 'funda', 'edredón', 'tapiz', 'alfombra', 'colcha', 'protector', 'organizador', 'canasto', 'perchero'],
  'Deportes': ['pelota', 'raqueta', 'guantes', 'bicicleta', 'patín', 'balón', 'botín', 'rodillera', 'mochila', 'bolsa', 'casco', 'bola', 'red', 'arco', 'pesa', 'mancuerna', 'cinta', 'mat', 'colchoneta', 'fit', 'sport', 'deporte', 'entrenamiento', 'camping', 'termo', 'botella'],
  'Perfumería': ['perfume', 'colonia', 'fragancia', 'maquillaje', 'cosmético', 'labial', 'rímel', 'delineador', 'sombra', 'base', 'polvo', 'crema', 'shampoo', 'acondicionador', 'jabón', 'desodorante', 'protector solar', 'after shave', 'esmalte', 'cuidado', 'hidratante', 'serum', 'tónico'],
  'Todas': [],
  'Otros': [],
};

const SUBCATEGORIA_ROPA_KEYWORDS: Record<SubcategoriaRopa, string[]> = {
  'Camisas': ['camisa', 'shirt', 'polo', 'chomba', 'blazer', 'saco', 'americana'],
  'Remeras': ['remera', 'camiseta', 't-shirt', 'tshirt', 'polera', 'musculosa', 'top', 'algodón'],
  'Shorts': ['short', 'bermuda'],
  'Pantalones': ['pantalón', 'jeans', 'pants', 'jogging', 'joggin', 'calza', 'leggings'],
  'Zapatillas': ['zapatilla', 'sneaker', 'deportiva', 'calzado', 'zapato', 'botín', 'bota', 'running', 'training', 'walking'],
  'Accesorios': ['gorro', 'gorra', 'sombrero', 'bufanda', 'corbata', 'pañuelo', 'cinturón', 'bolsa', 'mochila', 'riñonera', 'cartera', 'mochi', 'morral'],
  'Buzos': ['buzo', 'sudadera', 'hoodie', 'chamarra', 'campera', 'chaqueta', 'abrigo', 'saco', 'parka', 'rompevientos', 'cazadora'],
  'Todas': [],
};

const GENERO_KEYWORDS: Record<Exclude<Genero, 'Todas'>, string[]> = {
  'Hombre': ['hombre', 'masculino', 'masculina'],
  'Mujer': ['mujer', 'femenino', 'femenina'],
  'Unisex': ['unisex'],
  'Niños': ['niño', 'niña', 'nino', 'nina', 'kids', 'infantil', 'junior', 'jr'],
};

/**
 * Categoriza un producto basándose en palabras clave en su nombre
 */
export const categorizarProducto = (nombre: string): Categoria => {
  const nombreLower = nombre.toLowerCase();

  for (const [categoria, keywords] of Object.entries(CATEGORIA_KEYWORDS)) {
    if (keywords.some(keyword => nombreLower.includes(keyword))) {
      return categoria as Categoria;
    }
  }

  return 'Otros';
};

/**
 * Obtiene la subcategoría de ropa para un producto
 */
export const obtenerSubcategoriaRopa = (nombre: string): SubcategoriaRopa => {
  const nombreLower = nombre.toLowerCase();

  for (const [subcategoria, keywords] of Object.entries(SUBCATEGORIA_ROPA_KEYWORDS)) {
    if (subcategoria === 'Todas') continue;
    if (keywords.some(keyword => nombreLower.includes(keyword))) {
      return subcategoria as SubcategoriaRopa;
    }
  }

  return 'Todas';
};

/**
 * Obtiene el género de un producto de ropa basándose en palabras clave
 */
export const obtenerGenero = (nombre: string): Genero => {
  const nombreLower = nombre.toLowerCase();

  for (const [genero, keywords] of Object.entries(GENERO_KEYWORDS)) {
    if (keywords.some(keyword => nombreLower.includes(keyword))) {
      return genero as Genero;
    }
  }

  return 'Todas';
};

/**
 * Enriquece ofertas con categoría, subcategoría y género
 */
export const enriquecerOfertas = (ofertas: Oferta[]): Oferta[] => {
  return ofertas.map(oferta => ({
    ...oferta,
    categoria: categorizarProducto(oferta.nombre),
    subcategoria: categorizarProducto(oferta.nombre) === 'Ropa' 
      ? obtenerSubcategoriaRopa(oferta.nombre)
      : undefined,
    genero: categorizarProducto(oferta.nombre) === 'Ropa'
      ? obtenerGenero(oferta.nombre)
      : undefined,
  }));
};

/**
 * Mapeo de talles numéricos a letras
 * Convierte números de pantalones/jeans a tallas estándar
 */
const NUMERIC_TO_SIZE_MAP: Record<string, SizeTalle> = {
  // Talles pequeños (niños/juveniles)
  '10': 'XS',
  '12': 'XS',
  '14': 'S',
  '16': 'S',
  
  // Talles de pantalones/jeans (adultos)
  '36': 'XS',
  '38': 'S',
  '40': 'S',
  '42': 'M',
  '44': 'M',
  '46': 'L',
  '48': 'L',
  '50': 'XL',
  '52': 'XL',
  '54': 'XXL',
  '56': 'XXL',
  
  // Talles Jean/denim específicos
  '26': 'XS',
  '27': 'XS',
  '28': 'S',
  '29': 'S',
  '30': 'M',
  '31': 'M',
  '32': 'L',
  '33': 'L',
  '34': 'XL',
  '35': 'XL',
};

/**
 * Mapeo de talles en inglés a notación estándar
 */
const ENGLISH_TO_SIZE_MAP: Record<string, SizeTalle> = {
  'extra extra small': 'XXS',
  'extra small': 'XS',
  'small': 'S',
  'medium': 'M',
  'large': 'L',
  'extra large': 'XL',
  'xxl': 'XXL',
  'xxxl': 'XXL',
};

/**
 * Normaliza un talle a notación estándar (XS, S, M, L, XL, XXL)
 */
export const normalizarTalle = (talle: string): SizeTalle => {
  const talleLower = talle.toLowerCase().trim();
  
  // Buscar en mapeo de inglés
  if (ENGLISH_TO_SIZE_MAP[talleLower]) {
    return ENGLISH_TO_SIZE_MAP[talleLower];
  }
  
  // Buscar en mapeo numérico
  if (NUMERIC_TO_SIZE_MAP[talleLower]) {
    return NUMERIC_TO_SIZE_MAP[talleLower];
  }
  
  // Si es un número sin mapeo, intentar inferir
  const numTalle = parseInt(talleLower);
  if (!isNaN(numTalle)) {
    if (numTalle < 12) return 'XXS';
    if (numTalle < 16) return 'XS';
    if (numTalle < 20) return 'S';
    if (numTalle < 35) return 'M';
    if (numTalle < 42) return 'L';
    if (numTalle < 50) return 'XL';
    return 'XXL';
  }
  
  // Por defecto
  return 'M';
};

/**
 * Obtiene talles normalizados de un producto
 */
export const obtenerTallesNormalizados = (talles?: string[]): SizeTalle[] => {
  if (!talles || talles.length === 0) return [];
  
  const tallesNormalizados = new Set<SizeTalle>();
  
  for (const talle of talles) {
    const normalizado = normalizarTalle(talle);
    tallesNormalizados.add(normalizado);
  }
  
  return Array.from(tallesNormalizados).sort((a, b) => {
    const order = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
    return order.indexOf(a) - order.indexOf(b);
  });
};

/**
 * Extrae el número de talle de zapatilla de una cadena de talle
 */
export const extraerTalleZapatilla = (talle: string): number | null => {
  const trimmed = talle.trim();

  // "Talle: 450" o "Talle: 450 - Color: ..."
  const talleMatch = trimmed.match(/Talle:\s*(\d+)/i);
  if (talleMatch) {
    let num = parseInt(talleMatch[1], 10);
    if (num >= 100) num = Math.round(num / 10);
    if (num >= 19 && num <= 47) return num;
  }

  // " - Número" al final (Asics/Fila)
  const dashMatch = trimmed.match(/-\s*(\d+\.?\d*)\s*$/);
  if (dashMatch) {
    const num = parseFloat(dashMatch[1]);
    if (num >= 19 && num <= 47) return num;
  }

  // Número plano directo
  const num = parseFloat(trimmed);
  if (!isNaN(num) && num >= 19 && num <= 47) return num;

  // Cualquier número en el string
  const anyNum = trimmed.match(/\d+\.?\d*/);
  if (anyNum) {
    const n = parseFloat(anyNum[0]);
    if (n >= 19 && n <= 47) return n;
  }

  return null;
};

/**
 * Obtiene los talles de zapatilla como números (talle argentino 19-47)
 */
export const obtenerTallesZapatillas = (talles?: string[]): string[] => {
  if (!talles || talles.length === 0) return [];
  const sizes = new Set<string>();
  for (const talle of talles) {
    const num = extraerTalleZapatilla(talle);
    if (num !== null) {
      sizes.add(Number.isInteger(num) ? String(num) : num.toFixed(1));
    }
  }
  return Array.from(sizes).sort((a, b) => parseFloat(a) - parseFloat(b));
};
