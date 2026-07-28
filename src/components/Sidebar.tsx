import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Building2, 
  Users2, 
  CheckSquare, 
  Settings, 
  Plus, 
  PlusCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  openQuickCreate: (type: 'client' | 'contact' | 'opportunity' | 'task') => void;
}

export default function Sidebar({ currentTab, onNavigate, openQuickCreate }: SidebarProps) {
  const { tasks } = useCRM();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: BarChart3 },
    { id: 'opportunities', label: 'Funil e Vendas', icon: TrendingUp },
    { id: 'clients', label: 'Clientes e Leads', icon: Building2 },
    { id: 'contacts', label: 'Banco de Contatos', icon: Users2 },
    { id: 'tasks', label: 'Tarefas e Lembretes', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'settings', label: 'Ajustes e Sistemas', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-nature-sidebar border-r border-nature-border flex flex-col h-screen fixed left-0 top-0">
      
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-nature-border">
        <div className="flex items-center space-x-3">
          <div className="bg-nature-accent text-white p-2 rounded-xl flex items-center justify-center shadow-sm">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-nature-text-primary tracking-tight leading-none block">
              CoreCRM
            </span>
            <span className="text-[10px] text-nature-text-muted font-bold uppercase tracking-wider mt-0.5 block">
              SalesHub Engine
            </span>
          </div>
        </div>
      </div>

      {/* Main Links List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setQuickMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-nature-accent text-white shadow-sm font-medium' 
                  : 'text-nature-text-secondary hover:bg-nature-card-darker hover:text-nature-text-primary'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-nature-text-light'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-nature-card-darker text-nature-text-primary'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Add Menu and Help */}
      <div className="p-4 border-t border-nature-border space-y-3 relative">
        
        {/* Quick actions popup */}
        {quickMenuOpen && (
          <div className="absolute bottom-16 left-4 right-4 bg-white rounded-xl shadow-xl border border-nature-border p-2 space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <p className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest px-2.5 py-1.5 border-b border-nature-bg mb-1">
              Criar Novo Registro
            </p>
            <button
              onClick={() => { openQuickCreate('client'); setQuickMenuOpen(false); }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-nature-text-secondary hover:bg-nature-bg rounded-lg transition-colors text-left cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-nature-accent" />
              <span>Novo Cliente</span>
            </button>
            <button
              onClick={() => { openQuickCreate('contact'); setQuickMenuOpen(false); }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-nature-text-secondary hover:bg-nature-bg rounded-lg transition-colors text-left cursor-pointer"
            >
              <Users2 className="h-4 w-4 text-nature-text-muted" />
              <span>Novo Contato</span>
            </button>
            <button
              onClick={() => { openQuickCreate('opportunity'); setQuickMenuOpen(false); }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-nature-text-secondary hover:bg-nature-bg rounded-lg transition-colors text-left cursor-pointer"
            >
              <TrendingUp className="h-4 w-4 text-nature-accent" />
              <span>Nova Oportunidade</span>
            </button>
            <button
              onClick={() => { openQuickCreate('task'); setQuickMenuOpen(false); }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-nature-text-secondary hover:bg-nature-bg rounded-lg transition-colors text-left cursor-pointer"
            >
              <CheckSquare className="h-4 w-4 text-nature-text-light" />
              <span>Nova Tarefa</span>
            </button>
          </div>
        )}

        {/* Big Add New Action Button */}
        <button
          onClick={() => setQuickMenuOpen(!quickMenuOpen)}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-nature-accent hover:bg-nature-accent-hover transition-all shadow-sm active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Registro</span>
        </button>

        {/* Static Help Center Indicator */}
        <button
          onClick={() => {
            onNavigate('settings');
            alert("Rode as operações de teste à vontade. Para retornar aos dados padrão das imagens, basta abrir 'Settings' e clicar no botão 'Resetar Banco de Dados'.");
          }}
          className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-nature-text-muted hover:bg-nature-card-darker hover:text-nature-text-primary transition-colors text-left cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 text-nature-text-light" />
          <span>Central de Ajuda</span>
        </button>

      </div>
    </aside>
  );
}
