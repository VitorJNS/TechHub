import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { CRMTask } from '../types/crm';
import { CheckSquare, Plus, Search, Trash2, Calendar, ShieldCheck, X, CheckCircle } from 'lucide-react';

export default function TasksView() {
  const { tasks, currentUser, users, addTask, toggleTaskCompleted, deleteTask, updateTask } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Quick task modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentUser?.id || 'u-1');

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'PENDING' ? !t.completed :
      t.completed;

    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Por favor insira um título para a tarefa.');
      return;
    }

    addTask({
      title,
      priority,
      category: category || 'General',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      dueTime: dueTime || undefined,
      notes: notes || undefined,
      assignedTo: assignedTo || undefined
    });

    // Reset fields
    setTitle('');
    setPriority('MEDIUM');
    setCategory('General');
    setDueDate('');
    setDueTime('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 font-sans">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Tasks & Reminders
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Build and prioritize your sales pipeline workflows, reminders, and schedules.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 font-semibold text-xs text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New CRM Task</span>
        </button>
      </div>

      {/* FILTER & CONTROL PANEL bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Toggle Pills status (ALL, PENDING, COMPLETED) */}
        <div className="inline-flex bg-gray-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'PENDING' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Pending ({tasks.filter(t=>!t.completed).length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'COMPLETED' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Completed ({tasks.filter(t=>t.completed).length})
          </button>
        </div>

        {/* Searching and Priority Dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, priorities, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-gray-50/20 text-gray-800"
            />
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-3 pr-8 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 bg-white cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

      </div>

      {/* TASKS LIST */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden divide-y divide-gray-100">
        
        {filteredTasks.map((task) => {
          const handlerUser = users.find(u => u.id === task.assignedTo);
          return (
            <div 
              key={task.id} 
              className={`p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-100 hover:bg-gray-50/30 ${
                task.completed ? 'bg-gray-50/20' : ''
              }`}
            >
              {/* Checkbox and text */}
              <div className="flex items-start space-x-4 max-w-xl">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompleted(task.id)}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 cursor-pointer"
                />
                <div className="space-y-1">
                  <p className={`text-xs font-bold leading-relaxed ${
                    task.completed ? 'line-through text-gray-400 font-medium' : 'text-gray-900 font-bold'
                  }`}>
                    {task.title}
                  </p>
                  
                  {task.notes && (
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                      {task.notes}
                    </p>
                  )}

                  {/* Task Metadata */}
                  <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pt-1.5 text-[10px] text-gray-400 font-bold font-mono">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm">
                      {task.category}
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="h-3 w-3 text-gray-300" />
                      <span>Due: {task.dueDate} {task.dueTime ? `at ${task.dueTime}` : ''}</span>
                    </span>
                    {handlerUser && (
                      <span className="text-gray-500">
                        Assigned: {handlerUser.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Priority pill, avatar, and Trash */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-gray-50 sm:border-0 pt-3 sm:pt-0">
                
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${
                  task.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' :
                  task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-slate-50 text-slate-500 border-slate-250/20'
                }`}>
                  {task.priority}
                </span>

                {handlerUser && (
                  <img 
                    className="h-7 w-7 rounded-lg object-cover ring-2 ring-gray-100"
                    src={handlerUser.avatarUrl} 
                    alt={handlerUser.name}
                    title={`Assigned to: ${handlerUser.name}`}
                    referrerPolicy="no-referrer"
                  />
                )}

                <button
                  onClick={() => {
                    if (confirm(`Excluir tarefa "${task.title}"?`)) {
                      deleteTask(task.id);
                    }
                  }}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                  title="Excluir Tarefa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

              </div>

            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="p-16 text-center text-xs text-gray-400 font-semibold">
            Nenhuma tarefa cadastrada nesta seção. 
          </div>
        )}

      </div>

      {/* COMPREHENSIVE CREATE DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Criar Nova Tarefa / Lembrete
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTask} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  Título de Ação / Lembrete *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Enviar minuta de contrato para Vertex Corp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                    Categoria de Trabalho
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Internal, High Priority, SaaS"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                    Prioridade Operacional
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-lg text-gray-700 bg-white"
                  >
                    <option value="HIGH">HIGH (Vermelho)</option>
                    <option value="MEDIUM">MEDIUM (Amarelo)</option>
                    <option value="LOW">LOW (Cinza)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                    Data de Prazo (Due Date)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                    Hora de Alarme (Alarm Time)
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Assigned Colleague key picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  Atribuído Ao Colega
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-lg text-gray-700 bg-white"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  Metas ou Notas de Detalhamento
                </label>
                <textarea
                  placeholder="Se necessário, digite links, contatos ou itens para fazer antes..."
                  rows={2.5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Foot interactions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  Salvar Tarefa
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
