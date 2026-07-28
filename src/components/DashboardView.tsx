import React, { useMemo, useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  BadgeDollarSign,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  Phone,
  PieChart,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Interaction, OpportunityStage } from '../types/crm';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  openQuickTask: () => void;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

const stageLabels: Record<OpportunityStage, string> = {
  DISCOVERY: 'Descoberta',
  QUALIFIED: 'Qualificado',
  PROPOSAL: 'Proposta',
  NEGOTIATION: 'Negociacao',
  WON: 'Fechado',
  LOST: 'Perdido',
};

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function htmlEscape(value: string | number) {
  const text = String(value ?? '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getInteractionIcon(type: Interaction['type']) {
  switch (type) {
    case 'EMAIL':
      return <Mail className="h-4 w-4 text-nature-text-primary" />;
    case 'CALL':
      return <Phone className="h-4 w-4 text-nature-accent" />;
    case 'MEETING':
      return <Calendar className="h-4 w-4 text-nature-text-muted" />;
    default:
      return <FileText className="h-4 w-4 text-[#D97706]" />;
  }
}

function getInteractionColor(type: Interaction['type']) {
  switch (type) {
    case 'EMAIL':
      return 'bg-nature-card-dark border border-nature-border';
    case 'CALL':
      return 'bg-nature-card-darker border border-nature-border';
    case 'MEETING':
      return 'bg-nature-bg border border-nature-border-light';
    default:
      return 'bg-[#FCE8D5] border border-[#D97706]/10';
  }
}

export default function DashboardView({ onNavigate, openQuickTask }: DashboardViewProps) {
  const {
    currentUser,
    clients,
    opportunities,
    interactions,
    tasks,
    toggleTaskCompleted,
    addTask,
  } = useCRM();

  const [showInlineTask, setShowInlineTask] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlinePriority, setInlinePriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const todayIso = new Date().toISOString().split('T')[0];

  const dashboardData = useMemo(() => {
    const wonOpportunities = opportunities.filter(o => o.stage === 'WON');
    const openOpportunities = opportunities.filter(o => o.stage !== 'WON' && o.stage !== 'LOST');
    const lostOpportunities = opportunities.filter(o => o.stage === 'LOST');
    const activeClients = clients.filter(c => c.status === 'ACTIVE');
    const pendingClients = clients.filter(c => c.status === 'PENDING');
    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    const overdueTasks = pendingTasks.filter(t => t.dueDate < todayIso);
    const dueTodayTasks = pendingTasks.filter(t => t.dueDate === todayIso);
    const closedRevenue = wonOpportunities.reduce((sum, opportunity) => sum + opportunity.value, 0);
    const openPipeline = openOpportunities.reduce((sum, opportunity) => sum + opportunity.value, 0);
    const weightedForecast = openOpportunities.reduce(
      (sum, opportunity) => sum + opportunity.value * (opportunity.probability / 100),
      0
    );
    const winRate = wonOpportunities.length + lostOpportunities.length > 0
      ? (wonOpportunities.length / (wonOpportunities.length + lostOpportunities.length)) * 100
      : 0;
    const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

    const stageTotals = opportunities.reduce<Record<OpportunityStage, number>>((acc, opportunity) => {
      acc[opportunity.stage] = (acc[opportunity.stage] ?? 0) + opportunity.value;
      return acc;
    }, {} as Record<OpportunityStage, number>);
    const topStage = Object.entries(stageTotals).sort((a, b) => b[1] - a[1])[0] as [OpportunityStage, number] | undefined;

    const monthKeys = new Map<string, { key: string; label: string; revenue: number; deals: number }>();
    opportunities.forEach((opportunity) => {
      const referenceDate = parseDate(opportunity.expectedCloseDate) ?? parseDate(opportunity.updatedAt) ?? parseDate(opportunity.createdAt);
      if (!referenceDate) return;
      const key = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthKeys.has(key)) {
        monthKeys.set(key, {
          key,
          label: monthFormatter.format(referenceDate).replace('.', ''),
          revenue: 0,
          deals: 0,
        });
      }
      if (opportunity.stage === 'WON') {
        const month = monthKeys.get(key)!;
        month.revenue += opportunity.value;
        month.deals += 1;
      }
    });

    const monthlySales = Array.from(monthKeys.values()).sort((a, b) => a.key.localeCompare(b.key));
    const chartMonths = monthlySales.length > 0 ? monthlySales : [{ key: 'empty', label: 'Atual', revenue: 0, deals: 0 }];
    let cumulativeRevenue = 0;
    const salesGrowth = chartMonths.map((month) => {
      cumulativeRevenue += month.revenue;
      return { ...month, cumulativeRevenue };
    });

    return {
      activeClients,
      pendingClients,
      wonOpportunities,
      openOpportunities,
      pendingTasks,
      overdueTasks,
      dueTodayTasks,
      closedRevenue,
      openPipeline,
      weightedForecast,
      winRate,
      taskCompletionRate,
      salesGrowth,
      topStageName: topStage?.[0] ?? null,
      topStageValue: topStage?.[1] ?? 0,
    };
  }, [clients, opportunities, tasks, todayIso]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const remainingTasks = dashboardData.pendingTasks.length;
  const maxChartValue = Math.max(1, ...dashboardData.salesGrowth.map(point => point.cumulativeRevenue));
  const chartWidth = 700;
  const chartHeight = 240;
  const chartPadding = { top: 24, right: 28, bottom: 38, left: 58 };
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const chartPoints = dashboardData.salesGrowth.map((point, index, source) => {
    const x = chartPadding.left + (source.length === 1 ? plotWidth / 2 : (index / (source.length - 1)) * plotWidth);
    const y = chartPadding.top + plotHeight - (point.cumulativeRevenue / maxChartValue) * plotHeight;
    return { ...point, x, y };
  });
  const chartLinePath = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const chartAreaPath = `${chartLinePath} L ${chartPoints[chartPoints.length - 1]?.x ?? chartPadding.left} ${chartPadding.top + plotHeight} L ${chartPoints[0]?.x ?? chartPadding.left} ${chartPadding.top + plotHeight} Z`;
  const chartTicks = [1, 0.75, 0.5, 0.25, 0];

  const handleInlineTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    addTask({
      title: inlineTitle,
      priority: inlinePriority,
      category: 'Quick Task',
      dueDate: todayIso,
      assignedTo: currentUser?.id,
    });
    setInlineTitle('');
    setShowInlineTask(false);
  };

  const exportReport = () => {
    const generatedAt = new Date().toLocaleString('pt-BR');
    const reportWindow = window.open('', '_blank');

    if (!reportWindow) {
      alert('Permita pop-ups neste navegador para abrir o relatorio.');
      return;
    }

    const opportunityRows = opportunities
      .map((opportunity) => {
        const client = clients.find(item => item.id === opportunity.clientId);
        return `
          <tr>
            <td>
              <strong>${htmlEscape(opportunity.name)}</strong>
              <span>${htmlEscape(client?.company ?? 'Cliente nao localizado')}</span>
            </td>
            <td>${htmlEscape(stageLabels[opportunity.stage])}</td>
            <td>${htmlEscape(currencyFormatter.format(opportunity.value))}</td>
            <td>${htmlEscape(`${opportunity.probability}%`)}</td>
            <td>${htmlEscape(opportunity.expectedCloseDate)}</td>
          </tr>
        `;
      })
      .join('');

    const interactionRows = interactions
      .slice(0, 12)
      .map((interaction) => {
        const client = clients.find(item => item.id === interaction.clientId);
        return `
          <tr>
            <td>${htmlEscape(new Date(interaction.date).toLocaleDateString('pt-BR'))}</td>
            <td>${htmlEscape(interaction.type)}</td>
            <td>${htmlEscape(client?.company ?? 'Cliente nao localizado')}</td>
            <td>
              <strong>${htmlEscape(interaction.summary)}</strong>
              <span>${htmlEscape(interaction.details ?? 'Sem detalhes informados.')}</span>
            </td>
          </tr>
        `;
      })
      .join('');

    const chartRows = dashboardData.salesGrowth
      .map((point) => {
        const width = maxChartValue > 0 ? Math.max(2, (point.cumulativeRevenue / maxChartValue) * 100) : 2;
        return `
          <div class="bar-row">
            <span>${htmlEscape(point.label)}</span>
            <div><i style="width:${width}%"></i></div>
            <strong>${htmlEscape(currencyFormatter.format(point.cumulativeRevenue))}</strong>
          </div>
        `;
      })
      .join('');

    const reportHtml = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Relatorio CRM - Painel Geral</title>
          <style>
            :root {
              color: #2f3329;
              background: #f7f5f0;
              font-family: Inter, Arial, sans-serif;
            }
            * { box-sizing: border-box; }
            body { margin: 0; background: #f7f5f0; }
            .shell { max-width: 1120px; margin: 0 auto; padding: 28px; }
            .toolbar {
              position: sticky;
              top: 0;
              display: flex;
              justify-content: flex-end;
              gap: 10px;
              padding: 12px 0;
              background: #f7f5f0;
              z-index: 2;
            }
            button {
              border: 1px solid #d8d3c8;
              background: #727963;
              color: white;
              border-radius: 8px;
              padding: 10px 14px;
              font-weight: 800;
              cursor: pointer;
            }
            button.secondary { background: white; color: #4c5244; }
            header {
              background: white;
              border: 1px solid #ded8cd;
              border-radius: 14px;
              padding: 26px;
              margin-bottom: 18px;
            }
            h1 { margin: 0; font-size: 28px; letter-spacing: 0; }
            h2 { margin: 0 0 12px; font-size: 16px; }
            p { margin: 6px 0 0; color: #73786b; }
            .grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 12px;
              margin-bottom: 18px;
            }
            .card, section {
              background: white;
              border: 1px solid #ded8cd;
              border-radius: 12px;
              padding: 18px;
            }
            .card span { display: block; color: #73786b; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .card strong { display: block; margin-top: 8px; font-size: 22px; }
            .two-col {
              display: grid;
              grid-template-columns: 1.1fr 0.9fr;
              gap: 18px;
              margin-bottom: 18px;
            }
            .bar-row {
              display: grid;
              grid-template-columns: 52px 1fr 120px;
              align-items: center;
              gap: 12px;
              margin: 12px 0;
              font-size: 12px;
            }
            .bar-row div {
              height: 10px;
              background: #ece8df;
              border-radius: 999px;
              overflow: hidden;
            }
            .bar-row i {
              display: block;
              height: 100%;
              background: #727963;
              border-radius: 999px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th {
              color: #73786b;
              text-transform: uppercase;
              font-size: 10px;
              text-align: left;
              border-bottom: 1px solid #ded8cd;
              padding: 10px 8px;
            }
            td {
              border-bottom: 1px solid #eee9df;
              padding: 11px 8px;
              vertical-align: top;
            }
            td span { display: block; color: #73786b; margin-top: 3px; }
            footer { color: #73786b; font-size: 11px; padding: 14px 0; }
            @media (max-width: 760px) {
              .shell { padding: 14px; }
              .grid, .two-col { grid-template-columns: 1fr; }
              .bar-row { grid-template-columns: 44px 1fr; }
              .bar-row strong { grid-column: 2; }
            }
            @media print {
              body { background: white; }
              .shell { max-width: none; padding: 0; }
              .toolbar { display: none; }
              header, .card, section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <main class="shell">
            <div class="toolbar">
              <button class="secondary" onclick="window.close()">Fechar</button>
              <button onclick="window.print()">Imprimir / Salvar PDF</button>
            </div>

            <header>
              <h1>Relatorio CRM - Painel Geral</h1>
              <p>Gerado em ${htmlEscape(generatedAt)} por ${htmlEscape(currentUser?.name ?? 'Usuario CRM')}.</p>
            </header>

            <div class="grid">
              <div class="card"><span>Receita fechada</span><strong>${htmlEscape(currencyFormatter.format(dashboardData.closedRevenue))}</strong></div>
              <div class="card"><span>Pipeline aberto</span><strong>${htmlEscape(currencyFormatter.format(dashboardData.openPipeline))}</strong></div>
              <div class="card"><span>Forecast ponderado</span><strong>${htmlEscape(currencyFormatter.format(dashboardData.weightedForecast))}</strong></div>
              <div class="card"><span>Conversao</span><strong>${htmlEscape(`${percentFormatter.format(dashboardData.winRate)}%`)}</strong></div>
              <div class="card"><span>Clientes ativos</span><strong>${htmlEscape(dashboardData.activeClients.length)}</strong></div>
              <div class="card"><span>Clientes pendentes</span><strong>${htmlEscape(dashboardData.pendingClients.length)}</strong></div>
              <div class="card"><span>Tarefas concluidas</span><strong>${htmlEscape(`${completedTasks}/${totalTasks}`)}</strong></div>
              <div class="card"><span>Tarefas atrasadas</span><strong>${htmlEscape(dashboardData.overdueTasks.length)}</strong></div>
            </div>

            <div class="two-col">
              <section>
                <h2>Crescimento de vendas</h2>
                <p>Receita acumulada por mes com oportunidades fechadas.</p>
                ${chartRows || '<p>Nenhum negocio fechado para exibir no grafico.</p>'}
              </section>
              <section>
                <h2>Resumo executivo</h2>
                <p>Maior etapa do funil: <strong>${htmlEscape(dashboardData.topStageName ? stageLabels[dashboardData.topStageName] : 'Sem funil')}</strong></p>
                <p>Valor na maior etapa: <strong>${htmlEscape(currencyFormatter.format(dashboardData.topStageValue))}</strong></p>
                <p>Negocios em aberto: <strong>${htmlEscape(dashboardData.openOpportunities.length)}</strong></p>
                <p>Negocios fechados: <strong>${htmlEscape(dashboardData.wonOpportunities.length)}</strong></p>
              </section>
            </div>

            <section>
              <h2>Oportunidades</h2>
              <table>
                <thead>
                  <tr>
                    <th>Negocio</th>
                    <th>Etapa</th>
                    <th>Valor</th>
                    <th>Prob.</th>
                    <th>Fechamento</th>
                  </tr>
                </thead>
                <tbody>${opportunityRows || '<tr><td colspan="5">Nenhuma oportunidade cadastrada.</td></tr>'}</tbody>
              </table>
            </section>

            <section style="margin-top:18px">
              <h2>Atividades recentes</h2>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Cliente</th>
                    <th>Resumo</th>
                  </tr>
                </thead>
                <tbody>${interactionRows || '<tr><td colspan="4">Nenhuma atividade recente registrada.</td></tr>'}</tbody>
              </table>
            </section>

            <footer>
              Relatorio gerado automaticamente pelo CRM VS Tech.
            </footer>
          </main>
        </body>
      </html>
    `;

    reportWindow.document.open();
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
    reportWindow.focus();
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-200 font-sans pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nature-text-primary tracking-tight">
            Dashboard Geral
          </h1>
          <p className="text-sm text-nature-text-muted mt-1">
            Seja bem-vindo, {currentUser?.name}. Os indicadores abaixo usam os dados atuais do CRM.
          </p>
        </div>

        <div className="inline-flex self-start rounded-xl bg-white border border-nature-border p-1 shadow-xs md:self-auto">
          <button
            onClick={openQuickTask}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-nature-bg text-nature-text-primary border border-nature-border-light cursor-pointer"
          >
            Nova Tarefa
          </button>
          <button
            onClick={exportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-nature-text-muted hover:text-nature-text-primary rounded-lg cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Gerar Relatorio</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <MetricCard
          icon={<BadgeDollarSign className="h-5 w-5 text-nature-accent" />}
          label="Receita Fechada"
          value={currencyFormatter.format(dashboardData.closedRevenue)}
          badge={`${dashboardData.wonOpportunities.length} fechado(s)`}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-nature-accent" />}
          label="Pipeline Aberto"
          value={currencyFormatter.format(dashboardData.openPipeline)}
          badge={`${dashboardData.openOpportunities.length} em aberto`}
        />
        <MetricCard
          icon={<Users className="h-5 w-5 text-nature-accent" />}
          label="Clientes Ativos"
          value={String(dashboardData.activeClients.length)}
          badge={`${dashboardData.pendingClients.length} pendente(s)`}
        />
        <MetricCard
          icon={<PieChart className="h-5 w-5 text-nature-accent" />}
          label="Taxa de Conversao"
          value={`${percentFormatter.format(dashboardData.winRate)}%`}
          badge={`${dashboardData.wonOpportunities.length}/${dashboardData.wonOpportunities.length + opportunities.filter(o => o.stage === 'LOST').length || 0} ganhos`}
          tone="amber"
        />
        <MetricCard
          icon={<CheckCircle2 className="h-5 w-5 text-nature-accent" />}
          label="Tarefas Concluidas"
          value={`${completedTasks}/${totalTasks}`}
          badge={remainingTasks > 0 ? `${remainingTasks} restante(s)` : 'Fila limpa'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white p-6 rounded-2xl border border-nature-border shadow-xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-base font-bold text-nature-text-primary leading-none">
                Crescimento de Vendas
              </h3>
              <p className="text-xs text-nature-text-muted mt-1">
                Receita acumulada por mes com base em oportunidades marcadas como fechadas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MiniStat label="Forecast" value={currencyFormatter.format(dashboardData.weightedForecast)} />
              <MiniStat
                label="Maior etapa"
                value={dashboardData.topStageName ? stageLabels[dashboardData.topStageName] : 'Sem funil'}
              />
            </div>
          </div>

          <div className="mt-6 min-h-[300px]">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[300px] w-full" role="img">
              <defs>
                <linearGradient id="sales-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7D8471" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7D8471" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {chartTicks.map((tick) => {
                const y = chartPadding.top + plotHeight - tick * plotHeight;
                return (
                  <g key={tick}>
                    <line
                      x1={chartPadding.left}
                      y1={y}
                      x2={chartWidth - chartPadding.right}
                      y2={y}
                      stroke="#EDE9E3"
                      strokeWidth="1"
                    />
                    <text x="10" y={y + 4} className="fill-nature-text-light text-[10px] font-mono">
                      {compactCurrencyFormatter.format(maxChartValue * tick)}
                    </text>
                  </g>
                );
              })}
              <path d={chartAreaPath} fill="url(#sales-chart-fill)" />
              <path d={chartLinePath} fill="none" stroke="#7D8471" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {chartPoints.map((point) => (
                <g key={point.key}>
                  <circle cx={point.x} cy={point.y} r="6" fill="#7D8471" stroke="#FFFFFF" strokeWidth="3" />
                  <text x={point.x} y={chartHeight - 10} textAnchor="middle" className="fill-nature-text-muted text-[11px] font-bold uppercase">
                    {point.label}
                  </text>
                  <text x={point.x} y={Math.max(14, point.y - 12)} textAnchor="middle" className="fill-nature-text-primary text-[10px] font-bold">
                    {compactCurrencyFormatter.format(point.cumulativeRevenue)}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-nature-border-light pt-4 text-xs sm:grid-cols-3">
            <MiniStat label="Receita acumulada" value={currencyFormatter.format(dashboardData.closedRevenue)} />
            <MiniStat label="Pipeline em aberto" value={currencyFormatter.format(dashboardData.openPipeline)} />
            <MiniStat label="Valor na maior etapa" value={currencyFormatter.format(dashboardData.topStageValue)} />
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-nature-text-primary leading-none">
                Atividades Recentes
              </h3>
              <p className="text-xs text-nature-text-muted mt-1">
                Ultimos contatos registrados.
              </p>
            </div>
            <button
              onClick={() => onNavigate('clients')}
              className="text-xs text-nature-accent hover:text-nature-accent-hover font-semibold cursor-pointer"
            >
              Ver Todas
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {interactions.slice(0, 5).map((item) => {
              const relClient = clients.find(c => c.id === item.clientId);
              return (
                <div key={item.id} className="flex space-x-3 text-xs leading-normal">
                  <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 self-start ${getInteractionColor(item.type)}`}>
                    {getInteractionIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-nature-text-primary truncate">{item.summary}</p>
                    <p className="text-nature-text-muted line-clamp-1 mt-0.5">{item.details || 'Sem detalhes informados.'}</p>
                    <span className="inline-flex mt-1 text-[10px] font-semibold text-nature-accent bg-nature-bg border border-nature-border-light px-1.5 py-0.5 rounded-sm">
                      {relClient?.company ?? 'Cliente nao localizado'}
                    </span>
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
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-nature-text-primary leading-none">
                Tarefas Operacionais
              </h3>
              <p className="text-xs text-nature-text-muted mt-1">
                {dashboardData.dueTodayTasks.length} para hoje, {dashboardData.overdueTasks.length} atrasada(s).
              </p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-nature-text-secondary bg-nature-bg border border-nature-border">
              {percentFormatter.format(dashboardData.taskCompletionRate)}%
            </span>
          </div>

          <div className="space-y-3.5">
            {tasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-nature-border-light hover:border-nature-border hover:bg-nature-bg/30 transition-all text-xs"
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompleted(task.id)}
                    className="h-4.5 w-4.5 text-nature-accent border-nature-border rounded focus:ring-nature-accent mt-0.5 transition-all cursor-pointer"
                  />
                  <div className="min-w-0">
                    <p className={`font-semibold truncate ${task.completed ? 'line-through text-nature-text-light' : 'text-nature-text-primary'}`}>
                      {task.title}
                    </p>
                    <p className="text-[10px] text-nature-text-muted font-bold font-mono mt-1">
                      {task.category} {task.dueTime ? `- ${task.dueTime}` : ''}
                    </p>
                  </div>
                </div>
                <PriorityBadge priority={task.priority} />
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-[10px] text-nature-text-muted">
                    <span>Prioridade:</span>
                    {(['HIGH', 'MEDIUM', 'LOW'] as const).map(priority => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setInlinePriority(priority)}
                        className={`px-1.5 py-0.5 rounded font-bold ${inlinePriority === priority ? 'bg-nature-accent text-white' : 'bg-nature-card-dark hover:bg-nature-card-darker'}`}
                      >
                        {priority === 'HIGH' ? 'Alta' : priority === 'MEDIUM' ? 'Media' : 'Baixa'}
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-1.5">
                    <button type="button" onClick={() => setShowInlineTask(false)} className="text-[10px] font-semibold text-nature-text-muted hover:bg-nature-card-darker px-2 py-1 rounded">
                      Cancelar
                    </button>
                    <button type="submit" className="text-[10px] font-bold text-white bg-nature-accent hover:bg-nature-accent-hover px-2 py-1 rounded">
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
                <span>Nova Tarefa Rapida</span>
              </button>
            )}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-nature-text-primary leading-none">
                Negocios no Funil
              </h3>
              <p className="text-xs text-nature-text-muted mt-1">
                Oportunidades ordenadas por valor real.
              </p>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs text-nature-accent hover:text-nature-accent-hover font-semibold cursor-pointer"
            >
              Analisar Funil
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs leading-normal">
              <thead>
                <tr className="border-b border-nature-border-light text-[10px] font-bold text-nature-text-light uppercase tracking-widest">
                  <th className="pb-3 pr-2">Negocio</th>
                  <th className="pb-3 pr-2">Valor</th>
                  <th className="pb-3 pr-2">Etapa</th>
                  <th className="pb-3">Prob.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nature-border-light">
                {[...opportunities].sort((a, b) => b.value - a.value).slice(0, 5).map((item) => {
                  const client = clients.find(c => c.id === item.clientId);
                  return (
                    <tr key={item.id} className="hover:bg-nature-bg/10 group">
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-8 h-8 rounded-lg bg-nature-bg text-nature-accent font-black flex items-center justify-center shrink-0 border border-nature-border-light text-xs">
                            {item.name.substring(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-nature-text-primary truncate group-hover:text-nature-accent transition-colors">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-nature-text-muted truncate">{client?.company ?? 'Cliente nao localizado'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-2 font-mono font-bold text-nature-text-primary">
                        {currencyFormatter.format(item.value)}
                      </td>
                      <td className="py-3.5 pr-2">
                        <StageBadge stage={item.stage} />
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-16 bg-nature-bg rounded-full h-1.5 overflow-hidden shrink-0">
                            <div className="bg-nature-accent h-1.5 rounded-full" style={{ width: `${item.probability}%` }} />
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
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  badge,
  tone = 'green',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge: string;
  tone?: 'green' | 'amber';
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-36">
      <div className="flex items-center justify-between gap-3">
        <div className="p-2.5 bg-nature-bg rounded-xl border border-nature-border-light">
          {icon}
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
          tone === 'amber'
            ? 'text-amber-800 bg-[#FCE8D5] border-[#D97706]/10'
            : 'text-nature-accent bg-nature-bg border-nature-border'
        }`}>
          {badge}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold text-nature-text-muted uppercase tracking-widest leading-none">
          {label}
        </p>
        <p className="text-2xl font-black text-nature-text-primary mt-2 tracking-tight break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-nature-border-light bg-nature-bg/40 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-nature-text-muted">{label}</p>
      <p className="mt-1 text-xs font-black text-nature-text-primary truncate">{value}</p>
    </div>
  );
}

function StageBadge({ stage }: { stage: OpportunityStage }) {
  const classes =
    stage === 'WON'
      ? 'bg-nature-accent/10 text-nature-accent border-nature-accent/20'
      : stage === 'LOST'
        ? 'bg-red-50 text-red-600 border-red-100'
        : stage === 'NEGOTIATION'
          ? 'bg-[#F2F0ED] text-nature-text-secondary border-nature-border'
          : 'bg-[#FCE8D5] text-amber-800 border-[#D97706]/10';

  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider border ${classes}`}>
      {stageLabels[stage]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const classes =
    priority === 'HIGH'
      ? 'bg-[#FCE8D5] text-[#D97706] border-[#D97706]/10'
      : priority === 'MEDIUM'
        ? 'bg-nature-card-dark text-nature-text-secondary border-nature-border'
        : 'bg-nature-bg text-nature-text-light border-nature-border-light';

  return (
    <span className={`inline-flex shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${classes}`}>
      {priority === 'HIGH' ? 'Urgente' : priority === 'MEDIUM' ? 'Medio' : 'Baixo'}
    </span>
  );
}
