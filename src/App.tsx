import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import OpportunitiesView from './components/OpportunitiesView';
import ClientsView from './components/ClientsView';
import ContactsView from './components/ContactsView';
import TasksView from './components/TasksView';
import SettingsView from './components/SettingsView';

function MainAppShell() {
  const { currentUser } = useCRM();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Floating helper shortcut states for the sidebar "+ Add New" button.
  // When clicked, we route the user directly to that tab and trigger their registration popups.
  const handleOpenQuickCreate = (type: 'client' | 'contact' | 'opportunity' | 'task') => {
    switch (type) {
      case 'client':
        setCurrentTab('clients');
        alert("Atalho acionado! Clique no botão '+ Add New Client' no cabeçalho para registrar o cliente.");
        break;
      case 'contact':
        setCurrentTab('contacts');
        alert("Atalho acionado! Clique no botão 'New Corporate Contact' no topo para cadastrar o contato.");
        break;
      case 'opportunity':
        setCurrentTab('opportunities');
        alert("Atalho acionado! Clique no botão 'New Opportunity' no topo para registrar o negócio.");
        break;
      case 'task':
        setCurrentTab('tasks');
        alert("Atalho acionado! Clique no botão 'New CRM Task' no topo para formular a tarefa.");
        break;
    }
  };

  // If there is no authenticated corporate user, represent the login portal
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-nature-bg text-nature-text-primary flex font-sans antialiased">
      
      {/* Visual Sidebar Drawer (Left panel) */}
      <Sidebar 
        currentTab={currentTab} 
        onNavigate={setCurrentTab} 
        openQuickCreate={handleOpenQuickCreate} 
      />

      {/* Main Screen Container (Right side) */}
      <div className="flex-1 flex flex-col pl-0 lg:pl-64 min-w-0 transition-all duration-200">
        
        {/* Global Toolbar */}
        <Header 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onNavigate={setCurrentTab}
        />

        {/* Dynamic page content frame */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          
          {/* Diagnostic Global banner notification if a search pattern is logged */}
          {searchTerm && (
            <div className="mb-6 p-4 bg-nature-card-dark border border-nature-border rounded-2xl flex items-center justify-between text-xs text-nature-text-primary animate-in fade-in duration-100">
              <span>
                Filtro global de pesquisa ativado: <strong className="font-bold underline">"{searchTerm}"</strong>. 
                Navegue pelas abas para ver os resultados correspondentes.
              </span>
              <button 
                onClick={() => setSearchTerm('')}
                className="font-bold border border-nature-border bg-white hover:bg-nature-bg rounded px-2.5 py-1 transition-colors"
              >
                Limpar Busca
              </button>
            </div>
          )}

          {/* Tab switching router */}
          {currentTab === 'dashboard' && (
            <DashboardView 
              onNavigate={setCurrentTab}
              openQuickTask={() => handleOpenQuickCreate('task')}
            />
          )}

          {currentTab === 'opportunities' && (
            <OpportunitiesView />
          )}

          {currentTab === 'clients' && (
            <ClientsView />
          )}

          {currentTab === 'contacts' && (
            <ContactsView />
          )}

          {currentTab === 'tasks' && (
            <TasksView />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}

        </main>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <MainAppShell />
    </CRMProvider>
  );
}
