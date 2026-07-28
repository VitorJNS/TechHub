import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  TrendingUp, 
  Users, 
  PieChart, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical, 
  Plus, 
  Mail, 
  Phone, 
  Users2, 
  FileText,
  Calendar
} from 'lucide-react';
import { Opportunity, CRMTask, Client } from '../types/crm';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  openQuickTask: () => void;
}

export default function DashboardView({ onNavigate, openQuickTask }: DashboardViewProps) {
  const { 
    currentUser, 
    clients, 
    opportunities, 
    interactions, 
    tasks, 
    salesGrowth, 
    toggleTaskCompleted,
    addTask
  } = useCRM();

  // Inline state for adding a task quickly
  const [showInlineTask, setShowInlineTask] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlinePriority, setInlinePriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  // Calculate dynamic metrics
  const wonOpportunities = opportunities.filter(o => o.stage === 'WON');
  const totalSalesVal = wonOpportunities.reduce((sum, o) => sum + o.value, 0) || 458230; // fallback to screenshot mock

  const totalClients = clients.length || 152;
  
  // Win rate formula
  const wonCount = opportunities.filter(o => o.stage === 'WON').length;
  const lostCount = opportunities.filter(o => o.stage === 'LOST').length;
  const winRate = lostCount + wonCount > 0 
    ? Math.round((wonCount / (wonCount + lostCount)) * 1000) / 10 
    : 64.5;

  const totalTasksToday = tasks.length;
  const completedTasksToday = tasks.filter(t => t.completed).length;
  const remainingTasks = totalTasksToday - completedTasksToday;

  // Render icons dynamically for interactions
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return <Mail className="h-4 w-4 text-nature-text-primary" />;
      case 'CALL': return <Phone className="h-4 w-4 text-nature-accent" />;
      case 'MEETING': return <Calendar className="h-4 w-4 text-nature-text-muted" />;
      default: return <FileText className="h-4 w-4 text-[#D97706]" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'EMAIL': return 'bg-nature-card-dark border border-nature-border';
      case 'CALL': return 'bg-nature-card-darker border border-nature-border';
      case 'MEETING': return 'bg-nature-bg border border-nature-border-light';
      default: return 'bg-[#FCE8D5] border border-[#D97706]/10';
    }
  };

  const handleInlineTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;
    
    addTask({
      title: inlineTitle,
      priority: inlinePriority,
      category: 'Quick Task',
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: currentUser?.id
    });
    setInlineTitle('');
    setShowInlineTask(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans pb-12">
      
      {/* Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nature-text-primary tracking-tight">
            Dashboard Geral
          </h1>
          <p className="text-sm text-nature-text-muted mt-1">
            Seja bem-vindo, {currentUser?.name}. Veja o andamento dos Leads hoje.
          </p>
        </div>

        {/* Floating Actions */}
        <div className="flex items-center space-x-3">
          <div className="inline-flex shadow-xs rounded-xl bg-white border border-nature-border p-1">
            <button className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-nature-bg text-nature-text-primary border border-nature-border-light">
              Agenda Semanal
            </button>
            <button 
              onClick={() => alert("Relatório exportado com sucesso! (Demonstração)")}
              className="px-3.5 py-1.5 text-xs font-semibold text-nature-text-muted hover:text-nature-text-primary rounded-lg cursor-pointer"
            >
              Exportar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 4 Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-nature-bg rounded-xl border border-nature-border-light">
              <TrendingUp className="h-5 w-5 text-nature-accent" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-nature-accent bg-nature-bg border border-nature-border">
              +12.5%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-nature-text-muted uppercase tracking-widest leading-none">
              Total em Negócios
            </p>
            <p className="text-2xl font-black text-nature-text-primary mt-2 tracking-tight">
              ${totalSalesVal.toLocaleString('en-US')}
            </p>
          </div>
        </div>

        {/* Card 2: New Leads */}
        <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-nature-bg rounded-xl border border-nature-border-light">
              <Users className="h-5 w-5 text-nature-accent" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-nature-accent bg-nature-bg border border-nature-border">
              +8.2%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-nature-text-muted uppercase tracking-widest leading-none">
              Clientes Ativos
            </p>
            <p className="text-2xl font-black text-nature-text-primary mt-2 tracking-tight">
              {totalClients}
            </p>
          </div>
        </div>

        {/* Card 3: Win Rate */}
        <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-nature-bg rounded-xl border border-nature-border-light">
              <PieChart className="h-5 w-5 text-nature-accent" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-amber-800 bg-[#FCE8D5] border border-[#D97706]/10">
              Taxa Saudável
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-nature-text-muted uppercase tracking-widest leading-none">
              Taxa de Conversão
            </p>
            <p className="text-2xl font-black text-nature-text-primary mt-2 tracking-tight">
              {winRate}%
            </p>
          </div>
        </div>

        {/* Card 4: Tasks Today */}
        <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-nature-bg rounded-xl border border-nature-border-light">
              <CheckCircle2 className="h-5 w-5 text-nature-accent" />
            </div>
            {remainingTasks > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-nature-text-primary bg-nature-card-dark border border-nature-border">
                {remainingTasks} Restando
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-nature-text-muted uppercase tracking-widest leading-none">
              Tarefas Pendentes
            </p>
            <p className="text-2xl font-black text-nature-text-primary mt-2 tracking-tight">
              {completedTasksToday}/{totalTasksToday}
            </p>
          </div>
        </div>

      </div>

      {/* Sales Growth Graph + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Growth Chart Canvas Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-nature-border shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-nature-text-primary leading-none">
                Crescimento de Vendas
              </h3>
              <p className="text-xs text-nature-text-muted mt-1">
                Faturamento acumulado ao longo dos meses
              </p>
            </div>
            <div className="inline-flex bg-nature-bg p-0.5 rounded-lg text-xs font-semibold">
              <span className="px-2.5 py-1 bg-white rounded-md text-nature-text-primary shadow-xs">Mês</span>
              <span className="px-2.5 py-1 text-nature-text-muted hover:text-nature-text-primary cursor-pointer">Semana</span>
            </div>
          </div>

          {/* Interactive Spark Graph via native responsive vector SVG */}
          <div className="flex-1 min-h-[220px] relative mt-4">
            <svg viewBox="0 0 700 220" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7D8471" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#7D8471" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#EDE9E3" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="90" x2="700" y2="90" stroke="#EDE9E3" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="140" x2="700" y2="140" stroke="#EDE9E3" strokeWidth="1" strokeDasharray="3" />

              {/* Area under the curve */}
              <path 
                d="M 20 180 Q 100 160, 180 150 T 300 100 T 400 110 T 520 80 T 680 50 L 680 180 L 20 180 Z" 
                fill="url(#chart-fill)" 
              />

              {/* Glowing Curve */}
              <path 
                d="M 20 180 Q 100 160, 180 150 T 300 100 T 400 110 T 520 80 T 680 50" 
                fill="none" 
                stroke="#7D8471" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Interactive nodes */}
              <circle cx="20" cy="180" r="5" fill="#7D8471" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="180" cy="150" r="5" fill="#7D8471" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="300" cy="100" r="5" fill="#7D8471" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="400" cy="110" r="5" fill="#7D8471" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="520" cy="80" r="5" fill="#7D8471" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="680" cy="50" r="6" fill="#6B705C" stroke="#FFFFFF" strokeWidth="3" />
            </svg>

            {/* Float values popup */}
            <div className="absolute top-2 right-4 bg-nature-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs animate-bounce">
              Pico: $458,230
            </div>
          </div>

          {/* X axis labels */}
          <div className="flex items-center justify-between px-2 mt-2 pt-2 border-t border-nature-border-light text-[10px] font-bold text-nature-text-light uppercase tracking-widest font-mono">
            {salesGrowth.map((p, idx) => (
              <span key={idx} className="w-12 text-center">{p.month}</span>
            ))}
          </div>
        </div>

        {/* Recent Activities Panel (Interactions Logs feed) */}
        <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-nature-text-primary leading-none">
                Atividades Recentes
              </h3>
              <p className="text-xs text-nature-text-muted mt-1">
                Últimos contatos e interações
              </p>
            </div>
            <button 
              onClick={() => onNavigate('clients')} 
              className="text-xs text-nature-accent hover:text-nature-accent-hover font-semibold cursor-pointer"
            >
              Ver Todas
            </button>
          </div>

          {/* Activities list */}
          <div className="mt-5 flex-1 space-y-4">
            {interactions.slice(0, 4).map((item) => {
              // Find related client
              const relClient = clients.find(c => c.id === item.clientId);
              return (
                <div key={item.id} className="flex space-x-3 text-xs leading-normal">
                  <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 self-start ${getInteractionColor(item.type)}`}>
                    {getInteractionIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-nature-text-primary truncate">
                      {item.summary}
                    </p>
                    <p className="text-nature-text-muted line-clamp-1 mt-0.5">
                      {item.details || 'Sem detalhes informados.'}
                    </p>
                    {relClient && (
                      <span className="inline-flex mt-1 text-[10px] font-semibold text-nature-accent bg-nature-bg border border-nature-border-light px-1.5 py-0.5 rounded-sm">
                        {relClient.company}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {interactions.length === 0 && (
              <div className="text-center py-12 text-xs text-nature-text-light">
                Nenhuma atividade recente registrada.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Tasks for today checklist + High Value Opportunities table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tasks for today block */}
        <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-nature-text-primary leading-none">
                Tarefas para Hoje
              </h3>
              <p className="text-xs text-nature-text-muted mt-1">
                Sua fila operacional direta
              </p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-nature-text-secondary bg-nature-bg border border-nature-border">
              {remainingTasks} pendentes
            </span>
          </div>

          {/* Interactive Checkbox list */}
          <div className="space-y-3.5 flex-1 py-1">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-start justify-between p-3.5 rounded-xl border border-nature-border-light hover:border-nature-border hover:bg-nature-bg/30 transition-all text-xs"
              >
                <div className="flex items-start space-x-3.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompleted(task.id)}
                    className="h-4.5 w-4.5 text-nature-accent border-nature-border rounded focus:ring-nature-accent mt-0.5 transition-all cursor-pointer"
                  />
                  <div>
                    <p className={`font-semibold ${task.completed ? 'line-through text-nature-text-light' : 'text-nature-text-primary'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-nature-accent" />
                      <span className="text-[10px] text-nature-text-muted font-bold font-mono">{task.category}</span>
                      {task.dueTime && (
                        <span className="text-[10px] text-nature-text-light font-medium">• Prazo {task.dueTime}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  task.priority === 'HIGH' ? 'bg-[#FCE8D5] text-[#D97706] border border-[#D97706]/10' :
                  task.priority === 'MEDIUM' ? 'bg-nature-card-dark text-nature-text-secondary border border-nature-border' :
                  'bg-nature-bg text-nature-text-light border border-nature-border-light'
                }`}>
                  {task.priority === 'HIGH' ? 'Urgente' : task.priority === 'MEDIUM' ? 'Médio' : 'Baixo'}
                </span>
              </div>
            ))}

            {showInlineTask ? (
              <form onSubmit={handleInlineTaskSubmit} className="p-3 border border-dashed border-nature-accent bg-nature-bg rounded-xl space-y-2.5 animate-in fade-in duration-100">
                <input
                  type="text"
                  placeholder="O que precisa ser feito em seguida?"
                  value={inlineTitle}
                  onChange={(e) => setInlineTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-nature-text-primary bg-white border border-nature-border rounded-lg focus:outline-none focus:ring-1 focus:ring-nature-accent"
                  required
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px] text-nature-text-muted">
                    <span>Prioridade:</span>
                    <button 
                      type="button" 
                      onClick={() => setInlinePriority('HIGH')} 
                      className={`px-1.5 py-0.5 rounded font-bold ${inlinePriority === 'HIGH' ? 'bg-[#D97706] text-white' : 'bg-nature-card-dark hover:bg-nature-card-darker'}`}
                    >
                      Alta
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setInlinePriority('MEDIUM')} 
                      className={`px-1.5 py-0.5 rounded font-bold ${inlinePriority === 'MEDIUM' ? 'bg-nature-accent text-white' : 'bg-nature-card-dark hover:bg-nature-card-darker'}`}
                    >
                      Média
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setInlinePriority('LOW')} 
                      className={`px-1.5 py-0.5 rounded font-bold ${inlinePriority === 'LOW' ? 'bg-nature-text-secondary text-white' : 'bg-nature-card-dark hover:bg-nature-card-darker'}`}
                    >
                      Baixa
                    </button>
                  </div>
                  <div className="flex space-x-1.5">
                    <button 
                      type="button" 
                      onClick={() => setShowInlineTask(false)} 
                      className="text-[10px] font-semibold text-nature-text-muted hover:bg-nature-card-darker px-2 py-1 rounded"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="text-[10px] font-bold text-white bg-nature-accent hover:bg-nature-accent-hover px-2 py-1 rounded"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowInlineTask(true)}
                className="w-full h-11 border border-dashed border-nature-border hover:border-nature-accent rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold text-nature-text-muted hover:text-nature-text-primary bg-nature-bg/30 hover:bg-white transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Tarefa Rápida</span>
              </button>
            )}
          </div>
        </div>

        {/* High-Value Opportunities Table block */}
        <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-nature-text-primary leading-none">
                Negócios no Funil
              </h3>
              <p className="text-xs text-nature-text-muted mt-1">
                Principais oportunidades em negociação
              </p>
            </div>
            <button 
              onClick={() => onNavigate('opportunities')} 
              className="text-xs text-nature-accent hover:text-nature-accent-hover font-semibold cursor-pointer"
            >
              Analisar Funil
            </button>
          </div>

          {/* Opportunities list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs leading-normal">
              <thead>
                <tr className="border-b border-nature-border-light text-[10px] font-bold text-nature-text-light uppercase tracking-widest">
                  <th className="pb-3 pr-2">Nome do Negócio</th>
                  <th className="pb-3 pr-2">Valor</th>
                  <th className="pb-3 pr-2">Estágio</th>
                  <th className="pb-3">Probabilidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nature-border-light">
                {opportunities
                  .sort((a,b) => b.value - a.value)
                  .slice(0, 4)
                  .map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-nature-bg/10 group">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center space-x-2.5">
                            <span className="w-8 h-8 rounded-lg bg-nature-bg text-nature-accent font-black flex items-center justify-center shrink-0 border border-nature-border-light text-xs">
                              {item.name.substring(0, 2).toUpperCase()}
                            </span>
                            <span className="font-bold text-nature-text-primary line-clamp-1 group-hover:text-nature-accent transition-colors">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-2 font-mono font-bold text-nature-text-primary">
                          ${item.value.toLocaleString()}
                        </td>
                        <td className="py-3.5 pr-2">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider border ${
                            item.stage === 'WON' ? 'bg-nature-accent/10 text-nature-accent border-nature-accent/20' :
                            item.stage === 'LOST' ? 'bg-red-50 text-red-600 border-red-100' :
                            item.stage === 'NEGOTIATION' ? 'bg-[#F2F0ED] text-nature-text-secondary border-nature-border' :
                            'bg-[#FCE8D5] text-amber-800 border-[#D97706]/10'
                          }`}>
                            {item.stage === 'WON' ? 'FECHADO' : item.stage === 'LOST' ? 'PERDIDO' : item.stage === 'NEGOTIATION' ? 'NEGOCIAÇÃO' : item.stage}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-16 bg-nature-bg rounded-full h-1.5 overflow-hidden shrink-0">
                              <div 
                                className="bg-nature-accent h-1.5 rounded-full" 
                                style={{ width: `${item.probability}%` }}
                              />
                            </div>
                            <span className="font-mono text-nature-text-muted font-bold">{item.probability}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {opportunities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-xs text-nature-text-light">
                      Nenhuma oportunidade cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
