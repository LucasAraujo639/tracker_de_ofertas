import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, Tag, ShoppingBag, Filter } from 'lucide-react';
import datosOfertas from './todas_las_ofertas.json';
import type { Oferta, Categoria, SubcategoriaRopa, SizeTalle, Genero } from './types';
import { CATEGORIAS, SUBCATEGORIAS_ROPA, SIZES_TALLE, GENEROS } from './types';
import { enriquecerOfertas, obtenerTallesNormalizados, obtenerTallesZapatillas } from './categorias';

// --- UTILIDADES ---
/**
 * Formatea un número como moneda argentina (ARS)
 */
const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
};

// --- COMPONENTES ---
/**
 * Tarjeta individual de producto
 */
interface ProductCardProps {
  oferta: Oferta;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ oferta }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full relative hover:-translate-y-1">
    <div className="absolute top-3 right-3 bg-gradient-to-br from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300 z-10 flex items-center gap-1">
      <span className="text-xl">🔥</span>
      {oferta.descuento}%
    </div>

    <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300 overflow-hidden flex items-center justify-center relative p-3">
      {oferta.imagen ? (
        <img 
          src={oferta.imagen} 
          alt={oferta.nombre}
          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-gray-100', 'to-gray-200');
          }}
        />
      ) : (
        <div className="text-gray-400 text-3xl">📦</div>
      )}
    </div>

    <div className="p-5 flex flex-col flex-grow">
      <div className="mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 uppercase tracking-wide border border-red-200">
          🏪 {oferta.tienda}
        </span>
      </div>

      <h3 className="text-sm font-bold text-gray-900 leading-snug mb-3 flex-grow line-clamp-3 group-hover:text-red-600 transition-colors duration-200" title={oferta.nombre}>
        {oferta.nombre}
      </h3>

      <div className="mt-auto mb-3">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xs font-medium text-gray-400 line-through">
            {formatearPrecio(oferta.precio_original)}
          </span>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
            Ahorro
          </span>
        </div>
        <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {formatearPrecio(oferta.precio_oferta)}
        </div>
      </div>
    </div>

    <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100 group-hover:from-red-50 group-hover:to-red-100 transition-all duration-300">
      <a 
        href={oferta.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
      >
        Ver Oferta <ExternalLink size={16} />
      </a>
    </div>
  </div>
);

/**
 * Filtros de categorías
 */
interface CategoryFiltersProps {
  categoriasDisponibles: Categoria[];
  categoriaSeleccionada: Categoria;
  onCategoriaChange: (categoria: Categoria) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ 
  categoriasDisponibles, 
  categoriaSeleccionada, 
  onCategoriaChange 
}) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
      <Filter size={20} className="text-red-500" />
      Categorías
    </h2>
    <div className="flex flex-wrap gap-3">
      {categoriasDisponibles.map(categoria => (
        <button
          key={categoria}
          onClick={() => onCategoriaChange(categoria)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95
            ${categoriaSeleccionada === categoria 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-lg' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:text-red-600'
            }`}
        >
          {CATEGORIAS[categoria]}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Filtros de subcategorías (Ropa)
 */
interface SubcategoryFiltersProps {
  subcategoriasDisponibles: SubcategoriaRopa[];
  subcategoriaSeleccionada: SubcategoriaRopa;
  onSubcategoriaChange: (subcategoria: SubcategoriaRopa) => void;
}

const SubcategoryFilters: React.FC<SubcategoryFiltersProps> = ({ 
  subcategoriasDisponibles, 
  subcategoriaSeleccionada, 
  onSubcategoriaChange 
}) => (
  <div className="mb-8 animate-slide-in-down">
    <h3 className="text-md font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
      <Tag size={18} className="text-blue-500" />
      Tipo de Prenda
    </h3>
    <div className="flex flex-wrap gap-2">
      {subcategoriasDisponibles.map(subcategoria => (
        <button
          key={subcategoria}
          onClick={() => onSubcategoriaChange(subcategoria)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95
            ${subcategoriaSeleccionada === subcategoria 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:text-blue-600'
            }`}
        >
          {SUBCATEGORIAS_ROPA[subcategoria]}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Filtros de talle (Ropa)
 */
interface SizeFiltersProps {
  tallesDisponibles: string[];
  talleSeleccionado: string;
  onTalleChange: (talle: string) => void;
}

const SizeFilters: React.FC<SizeFiltersProps> = ({
  tallesDisponibles,
  talleSeleccionado,
  onTalleChange
}) => (
  <div className="mb-8 animate-slide-in-down">
    <h3 className="text-md font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
      <Tag size={18} className="text-green-500" />
      Talle
    </h3>
    <div className="flex flex-wrap gap-2">
      {tallesDisponibles.map(talle => (
        <button
          key={talle}
          onClick={() => onTalleChange(talle)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95
            ${talleSeleccionado === talle 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-lg' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:text-green-600'
            }`}
        >
          {SIZES_TALLE[talle as SizeTalle] || talle}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Filtros de género (Ropa)
 */
interface GenderFiltersProps {
  generosDisponibles: Genero[];
  generoSeleccionado: Genero;
  onGeneroChange: (genero: Genero) => void;
}

const GenderFilters: React.FC<GenderFiltersProps> = ({
  generosDisponibles,
  generoSeleccionado,
  onGeneroChange
}) => (
  <div className="mb-8 animate-slide-in-down">
    <h3 className="text-md font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
      <Tag size={18} className="text-purple-500" />
      Género
    </h3>
    <div className="flex flex-wrap gap-2">
      {generosDisponibles.map(genero => (
        <button
          key={genero}
          onClick={() => onGeneroChange(genero)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95
            ${generoSeleccionado === genero 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:text-purple-600'
            }`}
        >
          {GENEROS[genero]}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Estado vacío
 */
interface EmptyStateProps {
  onClear: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onClear }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center flex flex-col items-center justify-center">
    <div className="text-6xl mb-4 animate-bounce">🔍</div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops, no hay resultados</h3>
    <p className="text-gray-600 mb-6 max-w-md">No encontramos ofertas que coincidan con tus filtros actuales. Intenta con otras palabras o cambia los filtros.</p>
    <button 
      onClick={onClear}
      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
    >
      🔄 Limpiar filtros
    </button>
  </div>
);

/**
 * Componente principal
 */
export default function TrackerDeOfertasReales() {
  const [busqueda, setBusqueda] = useState<string>('');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>('Todas');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria>('Todas');
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<SubcategoriaRopa>('Todas');
  const [generoSeleccionado, setGeneroSeleccionado] = useState<Genero>('Todas');
  const [talleSeleccionado, setTalleSeleccionado] = useState<string>('Todas');
  const [ordenamiento, setOrdenamiento] = useState<'descuento' | 'precio-asc' | 'precio-desc'>('descuento');

  // Enriquecer ofertas con categorías
  const ofertasEnriquecidas = useMemo<Oferta[]>(() => {
    return enriquecerOfertas(datosOfertas as Oferta[]);
  }, []);

  // Categorías disponibles
  const categoriasDisponibles = useMemo<Categoria[]>(() => {
    const categorias = new Set<Categoria>(
      ofertasEnriquecidas
        .map((oferta: Oferta) => (oferta.categoria as Categoria) || 'Otros')
        .filter((cat): cat is Categoria => cat !== undefined)
    );
    return ['Todas', ...Array.from(categorias).filter(c => c !== 'Todas')] as Categoria[];
  }, [ofertasEnriquecidas]);

  // Tiendas disponibles
  const tiendasDisponibles = useMemo<string[]>(() => {
    const tiendas = ofertasEnriquecidas.map(oferta => oferta.tienda);
    return ['Todas', ...new Set(tiendas)];
  }, [ofertasEnriquecidas]);

  // Subcategorías disponibles
  const subcategoriasDisponibles = useMemo<SubcategoriaRopa[]>(() => {
    const subcategorias = new Set<SubcategoriaRopa>();
    ofertasEnriquecidas
      .filter(oferta => oferta.categoria === 'Ropa')
      .forEach(oferta => {
        if (oferta.subcategoria) {
          subcategorias.add(oferta.subcategoria as SubcategoriaRopa);
        }
      });
    return ['Todas', ...Array.from(subcategorias).filter(s => s !== 'Todas')] as SubcategoriaRopa[];
  }, [ofertasEnriquecidas]);

  // Géneros disponibles
  const generosDisponibles = useMemo<Genero[]>(() => {
    const generos = new Set<Genero>();
    ofertasEnriquecidas
      .filter(oferta => oferta.categoria === 'Ropa')
      .forEach(oferta => {
        if (oferta.genero && oferta.genero !== 'Todas') {
          generos.add(oferta.genero as Genero);
        }
      });
    return ['Todas', ...Array.from(generos)] as Genero[];
  }, [ofertasEnriquecidas]);

  // Talles disponibles
  const tallesDisponibles = useMemo<string[]>(() => {
    if (categoriaSeleccionada !== 'Ropa') return ['Todas'];
    let candidatos = ofertasEnriquecidas.filter(oferta => oferta.categoria === 'Ropa');
    if (subcategoriaSeleccionada !== 'Todas') {
      candidatos = candidatos.filter(oferta => oferta.subcategoria === subcategoriaSeleccionada);
    }
    const esZapatillas = subcategoriaSeleccionada === 'Zapatillas';
    const tallesSet = new Set<string>();
    candidatos.forEach(oferta => {
      if (esZapatillas) {
        obtenerTallesZapatillas(oferta.talles).forEach(t => tallesSet.add(t));
      } else {
        obtenerTallesNormalizados(oferta.talles).forEach(t => tallesSet.add(t));
      }
    });
    if (esZapatillas) {
      return ['Todas', ...Array.from(tallesSet).sort((a, b) => parseFloat(a) - parseFloat(b))];
    }
    const orden = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
    return ['Todas', ...orden.filter(t => tallesSet.has(t))];
  }, [ofertasEnriquecidas, categoriaSeleccionada, subcategoriaSeleccionada]);

  // Filtrado
  const ofertasFiltradas = useMemo<Oferta[]>(() => {
    let filtradas = [...ofertasEnriquecidas];

    if (categoriaSeleccionada !== 'Todas') {
      filtradas = filtradas.filter(oferta => oferta.categoria === categoriaSeleccionada);
    }

    if (categoriaSeleccionada === 'Ropa' && subcategoriaSeleccionada !== 'Todas') {
      filtradas = filtradas.filter(oferta => oferta.subcategoria === subcategoriaSeleccionada);
    }

    if (categoriaSeleccionada === 'Ropa' && generoSeleccionado !== 'Todas') {
      filtradas = filtradas.filter(oferta => oferta.genero === generoSeleccionado);
    }

    if (categoriaSeleccionada === 'Ropa' && talleSeleccionado !== 'Todas') {
      const esZapatillas = subcategoriaSeleccionada === 'Zapatillas';
      filtradas = filtradas.filter(oferta => {
        if (esZapatillas) {
          const tallesZap = obtenerTallesZapatillas(oferta.talles);
          return tallesZap.includes(talleSeleccionado);
        }
        const tallesNorm = obtenerTallesNormalizados(oferta.talles);
        return tallesNorm.includes(talleSeleccionado as SizeTalle);
      });
    }

    if (tiendaSeleccionada !== 'Todas') {
      filtradas = filtradas.filter(oferta => oferta.tienda === tiendaSeleccionada);
    }

    if (busqueda.trim() !== '') {
      const textoBusqueda = busqueda.toLowerCase();
      filtradas = filtradas.filter(oferta => 
        oferta.nombre.toLowerCase().includes(textoBusqueda) ||
        oferta.tienda.toLowerCase().includes(textoBusqueda)
      );
    }

    // Aplicar ordenamiento
    if (ordenamiento === 'precio-asc') {
      filtradas.sort((a, b) => a.precio_oferta - b.precio_oferta);
    } else if (ordenamiento === 'precio-desc') {
      filtradas.sort((a, b) => b.precio_oferta - a.precio_oferta);
    } else {
      filtradas.sort((a, b) => b.descuento - a.descuento);
    }

    return filtradas;
  }, [busqueda, tiendaSeleccionada, categoriaSeleccionada, subcategoriaSeleccionada, generoSeleccionado, talleSeleccionado, ofertasEnriquecidas, ordenamiento]);

  // Handlers
  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setTiendaSeleccionada('Todas');
    setCategoriaSeleccionada('Todas');
    setSubcategoriaSeleccionada('Todas');
    setGeneroSeleccionado('Todas');
    setTalleSeleccionado('Todas');
    setOrdenamiento('descuento');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800 font-sans">
      
      <header className="bg-gradient-to-r from-white to-gray-50 border-b-2 border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl text-white shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Tag size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tracker de Ofertas 🎯</h1>
                <p className="text-sm text-gray-600 font-medium">Encuentra los mejores descuentos en Argentina</p>
              </div>
            </div>

            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-red-400" />
              </div>
              <input
                type="text"
                placeholder="Busca productos, marcas..."
                className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 sm:text-sm font-medium shadow-sm hover:border-gray-300"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <CategoryFilters 
          categoriasDisponibles={categoriasDisponibles}
          categoriaSeleccionada={categoriaSeleccionada}
          onCategoriaChange={(categoria) => {
            setCategoriaSeleccionada(categoria);
            setSubcategoriaSeleccionada('Todas');
            setGeneroSeleccionado('Todas');
            setTalleSeleccionado('Todas');
          }}
        />

        {categoriaSeleccionada === 'Ropa' && (
          <SubcategoryFilters 
            subcategoriasDisponibles={subcategoriasDisponibles}
            subcategoriaSeleccionada={subcategoriaSeleccionada}
            onSubcategoriaChange={(sub) => {
              setSubcategoriaSeleccionada(sub);
              setTalleSeleccionado('Todas');
            }}
          />
        )}

        {categoriaSeleccionada === 'Ropa' && generosDisponibles.length > 1 && (
          <GenderFilters
            generosDisponibles={generosDisponibles}
            generoSeleccionado={generoSeleccionado}
            onGeneroChange={(gen) => {
              setGeneroSeleccionado(gen);
              setTalleSeleccionado('Todas');
            }}
          />
        )}

        {categoriaSeleccionada === 'Ropa' && tallesDisponibles.length > 1 && (
          <SizeFilters
            tallesDisponibles={tallesDisponibles}
            talleSeleccionado={talleSeleccionado}
            onTalleChange={setTalleSeleccionado}
          />
        )}

        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-red-500" />
            Filtrar por Tienda
          </h2>
          <div className="flex flex-wrap gap-3">
            {tiendasDisponibles.map(tienda => (
              <button
                key={tienda}
                onClick={() => setTiendaSeleccionada(tienda)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95
                  ${tiendaSeleccionada === tienda 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-lg' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:text-red-600'
                  }`}
              >
                {tienda === 'Todas' ? '🏬 ' : '🛒 '}{tienda}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Filter size={20} className="text-blue-500" />
            Ordenar Por
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setOrdenamiento('descuento')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95
                ${ordenamiento === 'descuento' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:text-blue-600'
                }`}
            >
              🔥 Mayor Descuento
            </button>
            <button
              onClick={() => setOrdenamiento('precio-asc')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95
                ${ordenamiento === 'precio-asc' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-lg' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:text-green-600'
                }`}
            >
              💰 Menor Precio
            </button>
            <button
              onClick={() => setOrdenamiento('precio-desc')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95
                ${ordenamiento === 'precio-desc' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:text-purple-600'
                }`}
            >
              💸 Mayor Precio
            </button>
          </div>
        </div>

        <div className="mb-8 flex justify-between items-center bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
          <div>
            <p className="text-gray-700 font-medium">
              Se encontraron <span className="text-2xl font-bold text-red-600">{ofertasFiltradas.length}</span>
            </p>
            <p className="text-sm text-gray-600">ofertas increíbles para ti</p>
          </div>
          <div className="text-4xl">💰</div>
        </div>

        {ofertasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ofertasFiltradas.map((oferta, index) => (
              <div key={`${oferta.tienda}-${oferta.nombre}-${index}`} className="animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
                <ProductCard 
                  oferta={oferta}
                  index={index}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState onClear={handleLimpiarFiltros} />
        )}

      </main>
    </div>
  );
}
