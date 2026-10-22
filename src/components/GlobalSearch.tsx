import React, { useState, useRef, useEffect } from 'react';
import { Area, AreaId } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { Search, X, ArrowRight, Sparkles, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { searchAreas, SearchMatch } from '../utils/searchEngine';

interface GlobalSearchProps {
  areas: Area[];
  onSelectArea: (areaId: AreaId) => void;
  variant?: 'hero' | 'header';
  placeholder?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  areas,
  onSelectArea,
  variant = 'hero',
  placeholder = 'Buscar por actividad, oficio o producto (ej. tabaco, litio, comercio)...',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const searchResults: SearchMatch[] = trimmed ? searchAreas(trimmed, areas) : [];

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atajo de teclado global: '/' enfoca el buscador si no se está escribiendo en otro input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Manejo de teclado dentro del buscador
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) {
      if (e.key === 'ArrowDown' && trimmed) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = selectedIndex >= 0 ? searchResults[selectedIndex] : searchResults[0];
      if (target) {
        handleSelect(target.area.area_id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (areaId: AreaId) => {
    onSelectArea(areaId);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  // Helper para renderizar badge de tipo de coincidencia semántica
  const renderMatchBadge = (match: SearchMatch) => {
    if (!match.matchReason) return null;

    if (match.matchType === 'official') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>{match.matchReason}</span>
        </span>
      );
    }

    if (match.matchType === 'partial_observed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
          <span>{match.matchReason}</span>
        </span>
      );
    }

    if (match.matchType === 'no_applies') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <HelpCircle className="w-3 h-3 text-slate-500 shrink-0" />
          <span>{match.matchReason}</span>
        </span>
      );
    }

    // Alias orientativo
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
        <span>{match.matchReason}</span>
      </span>
    );
  };

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className={`relative w-full ${isHero ? 'max-w-2xl mx-auto' : 'max-w-xs'}`}>
      {/* Campo de búsqueda */}
      <div className="relative flex items-center">
        <Search
          className={`absolute left-3.5 pointer-events-none transition-colors ${
            isHero ? 'w-5 h-5 text-slate-400' : 'w-4 h-4 text-slate-400'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (trimmed) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Buscar actividades, oficios o productos en Jujuy"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
          className={`w-full bg-white text-slate-900 placeholder-slate-400 rounded-2xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            isHero
              ? 'pl-11 pr-20 py-3.5 text-base shadow-lg shadow-slate-200/50 border-slate-300 hover:border-slate-400'
              : 'pl-9 pr-14 py-2 text-xs shadow-2xs border-slate-200 hover:border-slate-300'
          }`}
        />

        {/* Acciones del input: Limpiar o Atajo */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Menú de resultados desplegable */}
      {isOpen && trimmed && (
        <div
          role="listbox"
          aria-label="Resultados de búsqueda"
          className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-96 overflow-y-auto animate-in fade-in duration-100"
        >
          {searchResults.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Coincidencias encontradas ({searchResults.length})</span>
                <span className="text-[10px] font-normal lowercase">Usá ↑↓ y enter para abrir</span>
              </div>

              {searchResults.map((match, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={match.area.area_id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(match.area.area_id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-100 flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected ? 'bg-brand-50 border border-brand-200 shadow-xs' : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                        <AreaIcon name={match.area.icono} size={20} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {match.area.area_id}
                          </span>
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {match.area.nombre}
                          </span>
                        </div>
                        {match.matchReason && (
                          <div className="pt-0.5">
                            {renderMatchBadge(match)}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {match.area.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-xs font-semibold text-brand-600 shrink-0 self-center pl-2">
                      <span className="hidden sm:inline mr-1">Explorar</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                No se encontraron actividades para &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Probá buscando por términos cotidianos como <em>litio</em>, <em>tabaco</em>, <em>comercio</em>, <em>turismo</em>, <em>salud</em> o <em>educación</em>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
