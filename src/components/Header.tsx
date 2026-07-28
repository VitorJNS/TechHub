import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Search, Bell, HelpCircle, LogOut, RefreshCw, User, Users, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onNavigate: (tab: string) => void;
}

export default function Header({ searchTerm, setSearchTerm, onNavigate }: HeaderProps) {
  const { currentUser, users, setCurrentUserById, logout, tasks } = useCRM();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Uncompleted tasks list
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 4);

  return (
    <header className="h-20 bg-nature-bg border-b border-nature-border-light flex items-center justify-between px-8 sticky top-0 z-40">
      
      {/* Search Input */}
      <div className="flex-1 max-w-md">
        <label htmlFor="search-field" className="sr-only">Search</label>
        <div className="relative w-full text-nature-text-light focus-within:text-nature-text-secondary">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-4 w-4 text-nature-text-light" aria-hidden="true" />
          </div>
          <input
            id="search-field"
            type="search"
            className="block w-full h-10 pl-10 pr-12 py-2 border border-nature-border rounded-full leading-5 bg-white text-nature-text-primary placeholder-nature-text-muted focus:outline-none focus:ring-2 focus:ring-nature-accent/20 transition-all text-sm"
            placeholder="Buscar leads, clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-[10px] uppercase tracking-wide font-bold text-nature-text-primary hover:text-nature-text-secondary bg-nature-card-dark hover:bg-nature-card-darker px-2 py-0.5 rounded-md transition-all"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Right Utilities */}
      <div className="flex items-center space-x-4">
        
        {/* Help Center */}
        <button 
          title="Manual e Guia do CRM"
          onClick={() => {
            alert("Bem-vindo ao SalesHub Enterprise CRM!\n\nEste protótipo roda 100% gravado no navegador usando localStorage.\n\nPrincipais Funcionalidades:\n• Dashboard dinâmico com métricas e gráfico SVG de Crescimento de Vendas\n• Criação de Clientes e Contatos vinculados\n• Cadastro de Oportunidades com probabilidade\n• Funil de Vendas Kanban interativo, onde você pode mover as oportunidades de estágio\n• Feed de Histórico de Interações integrado no Dashboard e no Cliente\n• Checkbox e criação rápida de tarefas diárias");
          }}
          className="p-1.5 rounded-lg text-nature-text-muted hover:text-nature-text-primary hover:bg-nature-card-darker transition-all cursor-pointer"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-1.5 rounded-lg text-nature-text-muted hover:text-nature-text-primary hover:bg-nature-card-darker transition-all relative cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {pendingTasks.length > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-nature-accent ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-white ring-1 ring-black/5 divide-y divide-nature-border-light focus:outline-none z-50">
              <div className="p-4">
                <p className="text-xs font-bold text-nature-text-lighter uppercase tracking-wider">
                  Lembretes e Avisos
                </p>
              </div>
              <div className="py-1 max-h-64 overflow-y-auto">
                {pendingTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-nature-text-muted">
                    Nenhuma tarefa pendente para hoje! 🎉
                  </div>
                ) : (
                  pendingTasks.map((t) => (
                    <div key={t.id} className="p-3 hover:bg-nature-bg flex items-start space-x-3 text-xs transition-colors">
                      <span className={`h-2 w-2 mt-1 rounded-full ${t.priority === 'HIGH' ? 'bg-amber-600' : t.priority === 'MEDIUM' ? 'bg-nature-accent' : 'bg-nature-text-light'}`} />
                      <div className="flex-1">
                        <p className="font-bold text-nature-text-primary">{t.title}</p>
                        <p className="text-nature-text-muted mt-0.5">Prazo: {t.dueDate} {t.dueTime ? `as ${t.dueTime}` : ''}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 bg-nature-bg text-center rounded-b-xl">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    onNavigate('tasks');
                  }}
                  className="text-xs text-nature-accent hover:text-[#6B705C] font-semibold cursor-pointer"
                >
                  Ver todas as tarefas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Swappable Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-nature-card-darker transition-all cursor-pointer text-left"
          >
            <img 
              className="h-8 w-8 rounded-xl object-cover ring-2 ring-nature-border-light"
              src={currentUser?.avatarUrl || AVATARS[0]} 
              alt={currentUser?.name}
              referrerPolicy="no-referrer"
            />
            <div className="hidden md:block">
              <p className="text-xs font-bold text-nature-text-primary leading-none">
                {currentUser?.name || "Anonymous User"}
              </p>
              <p className="text-[10px] text-nature-text-muted mt-0.5 leading-none font-semibold">
                {currentUser?.role || "Co-worker"}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black/5 divide-y divide-nature-border-light z-50">
              <div className="p-4 flex items-center space-x-3">
                <img 
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-nature-accent"
                  src={currentUser?.avatarUrl} 
                  alt={currentUser?.name}
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-sm font-bold text-nature-text-primary">{currentUser?.name}</p>
                  <p className="text-xs text-nature-text-muted truncate max-w-[140px] font-mono">{currentUser?.email}</p>
                </div>
              </div>

              {/* CRM Live Profile Switcher */}
              <div className="p-2 bg-nature-bg">
                <p className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest px-2.5 py-1">
                  Trocar de Perfil (Teste)
                </p>
                <div className="space-y-1">
                  {users.filter(u => u.id !== currentUser?.id).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserById(u.id);
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 p-2 hover:bg-white rounded-lg transition-all text-xs text-left"
                    >
                      <img 
                        className="h-6 w-6 rounded-md object-cover"
                        src={u.avatarUrl} 
                        alt={u.name}
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-nature-text-primary truncate">{u.name}</p>
                        <p className="text-[10px] text-nature-text-muted truncate">{u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-nature-text-primary hover:bg-nature-bg rounded-lg transition-colors cursor-pointer"
                >
                  <Users className="h-4 w-4 text-nature-text-muted" />
                  <span>Gerenciar Usuários</span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair do CRM</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
];
