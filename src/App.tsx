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
    'inicio' | 'asistente' | 'resultado' | 'areas' | 'detalle' | 'transversal' | 'metodologia'
  >('inicio');
  const [selectedAreaId, setSelectedAreaId] = useState<AreaId>('A01');
  const [preferences, setPreferences] = useState<PreferenciasExploracion>({
    motivo: null,
    areasSeleccionadas: ['A01'],
    tipoTarea: null,
    rangoEdad: null,
  });

  const areas = areasJson as Area[];

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'detalle' && param) {
      setSelectedAreaId(param as AreaId);
    }
    setCurrentView(view as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArea = (areaId: AreaId) => {
    setSelectedAreaId(areaId);
    setCurrentView('detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteWizard = (newPrefs: PreferenciasExploracion) => {
    setPreferences(newPrefs);
    if (newPrefs.areasSeleccionadas.length > 0) {
      setSelectedAreaId(newPrefs.areasSeleccionadas[0]);
    }
    setCurrentView('resultado');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTechnicalDetails = (areaId: AreaId) => {
    setSelectedAreaId(areaId);
    setCurrentView('detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header currentView={currentView} onNavigate={handleNavigate} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingSkeleton />}>
          {currentView === 'inicio' && (
            <HomePage
              areas={areas}
              onStartWizard={() => handleNavigate('asistente')}
              onExploreAreas={() => handleNavigate('areas')}
              onSelectArea={handleSelectArea}
              onNavigateMethodology={() => handleNavigate('metodologia')}
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
