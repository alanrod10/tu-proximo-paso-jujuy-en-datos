import React, { useState, Suspense } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AreasExplorerPage } from './pages/AreasExplorerPage';
import { Area, AreaId, PreferenciasExploracion } from './types';

// Carga liviana directa para navegación inmediata en Inicio y Explorador
import areasJson from '../data/areas.json';

// Carga perezosa (Lazy loading) para optimizar el bundle inicial y tiempo de carga
const ExplorationWizard = React.lazy(() =>
  import('./components/ExplorationWizard').then((m) => ({ default: m.ExplorationWizard }))
);
const ExplorationResultPage = React.lazy(() =>
  import('./pages/ExplorationResultPage').then((m) => ({ default: m.ExplorationResultPage }))
);
const AreaDetailPage = React.lazy(() =>
  import('./pages/AreaDetailPage').then((m) => ({ default: m.AreaDetailPage }))
);
const EilTransversalPage = React.lazy(() =>
  import('./pages/EilTransversalPage').then((m) => ({ default: m.EilTransversalPage }))
);
const MethodologyPage = React.lazy(() =>
  import('./pages/MethodologyPage').then((m) => ({ default: m.MethodologyPage }))
);

const LoadingSkeleton: React.FC = () => (
  <div className="py-12 space-y-6 animate-pulse" role="status" aria-label="Cargando módulo de datos...">
    <div className="h-8 bg-slate-200 rounded-xl w-1/3"></div>
    <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <div className="h-40 bg-slate-200 rounded-2xl"></div>
      <div className="h-40 bg-slate-200 rounded-2xl"></div>
      <div className="h-40 bg-slate-200 rounded-2xl"></div>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'inicio' | 'asistente' | 'resultado' | 'areas' | 'comparador' | 'detalle' | 'transversal' | 'metodologia'
  >('inicio');
  const [selectedAreaId, setSelectedAreaId] = useState<AreaId>('A01');
  const [preferences, setPreferences] = useState<PreferenciasExploracion>({
    motivo: null,
    areasSeleccionadas: ['A01'],
    tipoTarea: null,
    rangoEdad: null,
  });

  const areas = areasJson as Area[];
  const validAreaIds: AreaId[] = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10', 'A11', 'A12'];

  // Sincronización bidireccional con el historial del navegador (Hash Router)
  const parseHash = React.useCallback(() => {
    const raw = window.location.hash.replace(/^#\/?/, '');
    if (!raw) return null;

    if (raw.startsWith('detalle/') || raw.startsWith('area/')) {
      const parts = raw.split('/');
      const aid = parts[1]?.toUpperCase() as AreaId;
      if (validAreaIds.includes(aid)) {
        return { view: 'detalle' as const, areaId: aid };
      }
      return { view: 'areas' as const };
    }

    const knownViews = ['inicio', 'asistente', 'resultado', 'areas', 'comparador', 'detalle', 'transversal', 'metodologia'] as const;
    if ((knownViews as readonly string[]).includes(raw)) {
      return { view: raw as typeof knownViews[number] };
    }

    return null;
  }, []);

  // Carga inicial y escucha de cambios en el historial (Back / Forward)
  React.useEffect(() => {
    const initial = parseHash();
    if (initial) {
      setCurrentView(initial.view);
      if (initial.areaId) setSelectedAreaId(initial.areaId);
    }

    const handleHashChange = () => {
      const match = parseHash();
      if (match) {
        setCurrentView(match.view);
        if (match.areaId) setSelectedAreaId(match.areaId);
      } else {
        setCurrentView('inicio');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [parseHash]);

  const updateHashAndState = (view: string, areaId?: AreaId) => {
    let targetHash = `#${view}`;
    if (view === 'detalle') {
      const aid = areaId || selectedAreaId;
      targetHash = `#detalle/${aid}`;
    }

    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  const handleNavigate = (view: string, param?: string) => {
    const targetArea = (view === 'detalle' && param) ? (param.toUpperCase() as AreaId) : selectedAreaId;
    if (view === 'detalle' && param) {
      setSelectedAreaId(targetArea);
    }
    setCurrentView(view as any);
    updateHashAndState(view, targetArea);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArea = (areaId: AreaId) => {
    setSelectedAreaId(areaId);
    setCurrentView('detalle');
    updateHashAndState('detalle', areaId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteWizard = (newPrefs: PreferenciasExploracion) => {
    setPreferences(newPrefs);
    if (newPrefs.areasSeleccionadas.length > 0) {
      setSelectedAreaId(newPrefs.areasSeleccionadas[0]);
    }
    setCurrentView('resultado');
    updateHashAndState('resultado');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTechnicalDetails = (areaId: AreaId) => {
    setSelectedAreaId(areaId);
    setCurrentView('detalle');
    updateHashAndState('detalle', areaId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        areas={areas}
        onSelectArea={handleSelectArea}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingSkeleton />}>
          {currentView === 'inicio' && (
            <HomePage
              areas={areas}
              onStartWizard={() => handleNavigate('asistente')}
              onExploreAreas={() => handleNavigate('areas')}
              onSelectArea={handleSelectArea}
              onNavigateMethodology={() => handleNavigate('metodologia')}
              onNavigateTransversal={() => handleNavigate('transversal')}
            />
          )}

          {currentView === 'asistente' && (
            <ExplorationWizard
              areas={areas}
              onComplete={handleCompleteWizard}
              onSkipToAreas={() => handleNavigate('areas')}
              onCancel={() => handleNavigate('inicio')}
            />
          )}

          {currentView === 'resultado' && (
            <ExplorationResultPage
              preferences={preferences}
              areas={areas}
              onSelectArea={handleSelectArea}
              onRestartWizard={() => handleNavigate('asistente')}
              onViewAllAreas={() => handleNavigate('areas')}
              onViewTechnicalDetails={handleViewTechnicalDetails}
              onViewMethodology={() => handleNavigate('metodologia')}
            />
          )}

          {currentView === 'areas' && (
            <AreasExplorerPage
              areas={areas}
              onSelectArea={handleSelectArea}
            />
          )}

          {currentView === 'comparador' && (
            <AreasExplorerPage
              areas={areas}
              onSelectArea={handleSelectArea}
              initialMode="comparador"
            />
          )}

          {currentView === 'detalle' && (
            <AreaDetailPage
              areaId={selectedAreaId}
              areas={areas}
              onBack={() => handleNavigate('areas')}
              onNavigateArea={handleSelectArea}
            />
          )}

          {currentView === 'transversal' && (
            <EilTransversalPage />
          )}

          {currentView === 'metodologia' && (
            <MethodologyPage
              areas={areas}
            />
          )}
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default App;
