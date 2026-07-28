import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { CRMUser } from '../types/crm';
import { 
  Users, 
  UserPlus, 
  Shield, 
  RotateCcw, 
  Database, 
  Building, 
  Briefcase, 
  CheckSquare, 
  History,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';

export default function SettingsView() {
  const { 
    users, 
    currentUser, 
    setCurrentUserById, 
    registerUser, 
    resetData,
    clients,
    contacts,
    opportunities,
    tasks,
    interactions
  } = useCRM();

  // New Colleague registration state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'Administrator' | 'Sales Manager' | 'Sales Representative'>('Sales Representative');

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) {
      alert('Nome e E-mail são obrigatórios!');
      return;
    }
    
    registerUser(regName, regEmail, regRole);
    setRegName('');
    setRegEmail('');
    setRegRole('Sales Representative');
    setShowRegModal(false);
    alert('Novo colega inserido com sucesso!');
  };

  const handleFactoryReset = () => {
    if (confirm('Atenção: Isso irá resetar todos os dados guardados em memória local para os dados iniciais das capturas de telas. Deseja continuar?')) {
      resetData();
      alert('Banco de dados em memória restaurado!');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12 font-sans md:max-w-4xl">
      
      {/* Settings Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          CRM Settings & Team Control
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Add/switch users, view diagnostic records, or reset custom database variables.
        </p>
      </div>

      {/* Grid segments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Statistics Database summary */}
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-gray-900 font-bold text-sm">
            <Database className="h-4 w-4 text-blue-600" />
            <span>Database Metrics</span>
          </div>
          
          <p className="text-xs text-gray-400">
            Current volumes saved in local browser storage:
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-500">Corporate Clients:</span>
              <span className="font-mono text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded-sm">{clients.length}</span>
            </div>
            
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-500">Human Contacts:</span>
              <span className="font-mono text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded-sm">{contacts.length}</span>
            </div>

            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-500">Opportunities:</span>
              <span className="font-mono text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded-sm">{opportunities.length}</span>
            </div>

            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-500">Activity Logs:</span>
              <span className="font-mono text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded-sm">{interactions.length}</span>
            </div>

            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-500">Total Tasks:</span>
              <span className="font-mono text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded-sm">{tasks.length}</span>
            </div>
          </div>
        </div>

        {/* Global actions (factory limits) */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 text-gray-900 font-bold text-sm">
              <RotateCcw className="h-4 w-4 text-amber-500" />
              <span>System Actions</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Use standard diagnostic resetting if you want to restore the CRM to its exact screenshot data representation (Alex Rivera principal account, pre-defined pipelines, interactive activities).
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
            <button
              onClick={handleFactoryReset}
              className="inline-flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-100 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Resetar Banco de Dados</span>
            </button>
            <button
              onClick={() => alert("Todo o banco de dados está sincronizado localmente em memória interna! Operações de teste permitidas.")}
              className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors"
            >
              <span>Verificar Integridade</span>
            </button>
          </div>
        </div>

      </div>

      {/* Team user management */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none">
                Gestão Básica de Usuários
              </h3>
              <p className="text-2xs text-gray-400 mt-1">
                Active operational managers listed in SalesHub
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowRegModal(true)}
            className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 cursor-pointer"
          >
            <UserPlus className="h-4.5 w-4.5" />
            <span>Colleague Account</span>
          </button>
        </div>

        {/* Colleagues list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map((u) => {
            const isCurrentUser = u.id === currentUser?.id;
            return (
              <div 
                key={u.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  isCurrentUser 
                    ? 'border-blue-400 bg-blue-50/20' 
                    : 'border-gray-100 hover:border-gray-250 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center space-x-3.5 text-xs">
                  <img 
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                    src={u.avatarUrl} 
                    alt={u.name}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-extrabold text-gray-900">{u.name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{u.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-sm">
                      {u.role}
                    </span>
                  </div>
                </div>

                {isCurrentUser ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 bg-white border border-blue-150 px-2 py-1 rounded-md shadow-xs shrink-0 select-none">
                    <Shield className="h-3 w-3 text-blue-500" />
                    <span>Logged In</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentUserById(u.id)}
                    className="text-2xs font-extrabold bg-gray-50 hover:bg-white text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-2xs cursor-pointer transition-all shrink-0"
                  >
                    Act as User
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REGISTRATION DIALOG OR SHORT FORM */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Cadastrar Novo Colega de Vendas
                </h3>
              </div>
              <button 
                onClick={() => setShowRegModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewUser} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sarah Miller"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  placeholder="sarah.miller@saleshub.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  Função Operacional
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-lg text-gray-700 bg-white"
                >
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              {/* Action operations */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  Inserir Colega
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
