import React, { useState } from 'react';
import { BarChart3, BookOpen, Layers, Menu, X, Info, Scale } from 'lucide-react';
import { Area, AreaId } from '../types';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  areas?: Area[];
  onSelectArea?: (areaId: AreaId) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, areas, onSelectArea }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: BarChart3 },
    { id: 'areas', label: '12 Áreas de Jujuy', icon: Layers },
    { id: 'comparador', label: 'Comparador', icon: Scale },
    { id: 'transversal', label: 'EIL Gran Jujuy (Transversal)', icon: Info },
    { id: 'metodologia', label: 'Fuentes y Metodología', icon: BookOpen },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Enlace de salto accesible para lectores de pantalla y teclado */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white text-sm font-semibold"
      >
        Saltar al contenido principal
      </a>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        {/* Barra superior de contexto de la plataforma */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-400 tracking-wide">Plataforma Interactiva</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 text-[11px] sm:text-xs">Estadísticas Económicas y Laborales de Jujuy</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
              DiPEC • OEDE / SIPA • EIL • MIP 2015
            </div>
          </div>
        </div>

        {/* Barra de Navegación Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo / Brand */}
            <button
              onClick={() => handleNav('inicio')}
              className="flex items-center gap-3 text-left rounded-xl p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shrink-0"
              aria-label="Ir a la página de inicio"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block leading-tight">
                  Tu Próximo Paso
                </span>
                <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">
                  Jujuy en Datos
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links & Search */}
            <div className="hidden md:flex items-center gap-3">
              {/* Buscador Global en Header (Desktop) */}
              {areas && onSelectArea && (
                <div className="w-64 lg:w-72">
                  <GlobalSearch
                    areas={areas}
                    onSelectArea={onSelectArea}
                    variant="header"
                    placeholder="Buscar actividad o código..."
                  />
                </div>
              )}

              <nav className="flex items-center gap-1" aria-label="Navegación principal">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 whitespace-nowrap ${
                        isActive
                          ? 'bg-brand-50 text-brand-800 border border-brand-200 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Botón Móvil */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
            {/* Buscador en Móvil */}
            {areas && onSelectArea && (
              <div className="pb-1">
                <GlobalSearch
                  areas={areas}
                  onSelectArea={(aid) => {
                    onSelectArea(aid);
                    setMobileMenuOpen(false);
                  }}
                  variant="header"
                  placeholder="Buscar actividad o código en Jujuy..."
                />
              </div>
            )}

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-800 border border-brand-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
