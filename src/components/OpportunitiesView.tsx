import React, { useMemo, useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Opportunity, OpportunityStage } from '../types/crm';
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  User,
  Building2,
  X,
  FileSpreadsheet,
  Clock3,
  Phone,
  Mail,
  Briefcase,
  CircleDot,
  History,
} from 'lucide-react';

type StageMeta = {
  id: OpportunityStage;
  title: string;
  color: string;
  badgeColor: string;
};

const STAGES: StageMeta[] = [
  {
    id: 'DISCOVERY',
    title: 'Descoberta / Contato',
    color: 'border-t-nature-text-muted bg-nature-bg/30',
    badgeColor: 'bg-nature-card-dark text-nature-text-secondary border border-nature-border',
  },
  {
    id: 'QUALIFIED',
    title: 'Qualificado / Lead',
    color: 'border-t-[#7D8471] bg-[#7D8471]/5',
    badgeColor: 'bg-white text-nature-accent border border-nature-border-light',
  },
  {
    id: 'PROPOSAL',
    title: 'Proposta de Escopo',
    color: 'border-t-[#D97706]/30 bg-[#FCE8D5]/10',
    badgeColor: 'bg-[#FCE8D5] text-[#D97706]',
  },
  {
    id: 'NEGOTIATION',
    title: 'Negociacao de SLA',
    color: 'border-t-nature-text-light bg-nature-bg/40',
    badgeColor: 'bg-nature-card-dark text-nature-text-muted border border-nature-border',
  },
  {
    id: 'WON',
    title: 'Fechado (Ganho)',
    color: 'border-t-emerald-500 bg-emerald-50/10',
    badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
  },
  {
    id: 'LOST',
    title: 'Fechado (Perdido)',
    color: 'border-t-red-400 bg-red-50/10',
    badgeColor: 'bg-red-50 text-red-800 border border-red-100',
  },
];

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function OpportunitiesView() {
  const {
    opportunities,
    clients,
    contacts,
    interactions,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMinVal, setFilterMinVal] = useState('');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newOppName, setNewOppName] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newStage, setNewStage] = useState<OpportunityStage>('DISCOVERY');
  const [newProbability, setNewProbability] = useState(30);
  const [newCloseDate, setNewCloseDate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);

  const getClientCompany = (clientId: string) => {
    const client = clients.find((item) => item.id === clientId);
    return client ? client.company : 'Empresa nao encontrada';
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((item) => item.id === clientId);
    return client ? client.name : 'Lead nao encontrado';
  };

  const filteredOpps = opportunities.filter((opp) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      opp.name.toLowerCase().includes(normalizedSearch) ||
      getClientCompany(opp.clientId).toLowerCase().includes(normalizedSearch) ||
      getClientName(opp.clientId).toLowerCase().includes(normalizedSearch);

    const matchesMinVal = filterMinVal ? opp.value >= Number(filterMinVal) : true;

    return matchesSearch && matchesMinVal;
  });

  const selectedOpportunity =
    opportunities.find((opp) => opp.id === selectedOpportunityId) ?? null;
  const selectedClient = selectedOpportunity
    ? clients.find((client) => client.id === selectedOpportunity.clientId) ?? null
    : null;
  const selectedContacts = selectedClient
    ? contacts.filter((contact) => contact.clientId === selectedClient.id)
    : [];

  const selectedInteractions = useMemo(() => {
    if (!selectedClient) return [];
    return interactions
      .filter((interaction) => interaction.clientId === selectedClient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interactions, selectedClient]);

  const firstInteraction = selectedInteractions[selectedInteractions.length - 1] ?? null;
  const stageMeta =
    STAGES.find((stage) => stage.id === selectedOpportunity?.stage) ?? STAGES[0];

  const handleDragStart = (event: React.DragEvent, id: string) => {
    setDraggingCardId(id);
    event.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, targetStage: OpportunityStage) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || draggingCardId;
    if (id) {
      updateOpportunity(id, { stage: targetStage });
    }
    setDraggingCardId(null);
  };

  const shiftStage = (opp: Opportunity, direction: 'prev' | 'next') => {
    const currentIdx = STAGES.findIndex((stage) => stage.id === opp.stage);
    if (direction === 'prev' && currentIdx > 0) {
      updateOpportunity(opp.id, { stage: STAGES[currentIdx - 1].id });
    } else if (direction === 'next' && currentIdx < STAGES.length - 1) {
      updateOpportunity(opp.id, { stage: STAGES[currentIdx + 1].id });
    }
  };

  const handleCreateSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newOppName || !newClientId || !newValue) {
      alert('Por favor, preencha o Nome, Cliente e Valor.');
      return;
    }

    const opportunity = addOpportunity({
      name: newOppName,
      clientId: newClientId,
      value: Number(newValue),
      stage: newStage,
      probability: Number(newProbability),
      expectedCloseDate: newCloseDate || new Date().toISOString().split('T')[0],
      description: newDescription,
    });

    setNewOppName('');
    setNewClientId('');
    setNewValue('');
    setNewStage('DISCOVERY');
    setNewProbability(30);
    setNewCloseDate('');
    setNewDescription('');
    setShowAddModal(false);
    setSelectedOpportunityId(opportunity.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nature-text-primary">
            Funil de Vendas Kanban
          </h1>
          <p className="mt-1 text-xs text-nature-text-muted">
            Clique em um lead para abrir o resumo completo da empresa, contato e historico.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center space-x-2 self-start rounded-xl bg-nature-accent px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-nature-accent-hover md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Oportunidade</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-nature-border bg-white p-4 sm:flex-row">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-nature-text-light" />
          <input
            type="text"
            placeholder="Buscar por negocio, empresa ou lead..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-nature-border bg-nature-bg/30 py-2 pl-9 pr-4 text-xs text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent"
          />
        </div>

        <div className="flex w-full items-center space-x-3 sm:w-auto">
          <label className="shrink-0 font-mono text-[10px] font-bold uppercase text-nature-text-muted">
            Valor Min:
          </label>
          <input
            type="number"
            placeholder="Ex: 50000"
            value={filterMinVal}
            onChange={(event) => setFilterMinVal(event.target.value)}
            className="w-full rounded-lg border border-nature-border px-3 py-1.5 text-xs text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent sm:w-28"
          />
          {filterMinVal && (
            <button
              onClick={() => setFilterMinVal('')}
              className="text-2xs font-bold text-nature-text-muted hover:text-nature-text-primary"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-[1240px] space-x-4 px-1">
          {STAGES.map((col) => {
            const levelOpps = filteredOpps.filter((opp) => opp.stage === col.id);
            const sumValue = levelOpps.reduce((sum, opp) => sum + opp.value, 0);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, col.id)}
                className={`w-80 shrink-0 rounded-2xl border-x border-b border-nature-border-light border-t-4 p-4 shadow-sm transition-colors duration-150 ${col.color} ${
                  draggingCardId ? 'hover:bg-nature-accent/5' : ''
                }`}
              >
                <div className="mb-3 flex items-center justify-between border-b border-nature-border pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold leading-none text-nature-text-primary">
                      {col.title}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${col.badgeColor}`}
                    >
                      {levelOpps.length}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-nature-text-muted">
                    ${sumValue.toLocaleString()}
                  </span>
                </div>

                <div className="min-h-[120px] space-y-3 overflow-y-auto pr-1">
                  {levelOpps.map((opp) => {
                    const client = clients.find((item) => item.id === opp.clientId);
                    const isSelected = opp.id === selectedOpportunityId;

                    return (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={(event) => handleDragStart(event, opp.id)}
                        onClick={() => setSelectedOpportunityId(isSelected ? null : opp.id)}
                        className={`group relative space-y-3 rounded-xl border bg-white p-4 shadow-xs transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-nature-accent ring-1 ring-nature-accent/20'
                            : 'cursor-grab border-nature-border-light active:cursor-grabbing'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-nature-text-muted">
                            {client ? client.company : 'Projeto direto'}
                          </span>

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              if (confirm('Tem certeza de que deseja deletar essa oportunidade de vendas?')) {
                                deleteOpportunity(opp.id);
                                if (selectedOpportunityId === opp.id) {
                                  setSelectedOpportunityId(null);
                                }
                              }
                            }}
                            title="Excluir oportunidade"
                            className="rounded p-0.5 text-nature-text-light opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div>
                          <p className="line-clamp-2 text-xs font-bold leading-normal text-nature-text-secondary">
                            {opp.name}
                          </p>
                          <p className="mt-1 font-mono text-sm font-black text-nature-text-primary">
                            ${opp.value.toLocaleString()}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between font-mono text-[10px] font-bold text-nature-text-muted">
                            <span>Probabilidade:</span>
                            <span>{opp.probability}%</span>
                          </div>
                          <div className="h-1 w-full rounded-full bg-nature-bg">
                            <div
                              className={`h-1 rounded-full ${
                                opp.probability >= 80
                                  ? 'bg-[#7D8471]'
                                  : opp.probability >= 50
                                    ? 'bg-amber-600'
                                    : 'bg-nature-text-light'
                              }`}
                              style={{ width: `${opp.probability}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-nature-border-light pt-1 font-mono text-[10px] font-semibold text-nature-text-light">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-nature-text-light" />
                            <span>Previsto: {opp.expectedCloseDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-1 border-t border-nature-border-light pt-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <span className="mr-auto text-[9px] font-medium text-nature-text-light">
                            Estagio:
                          </span>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              shiftStage(opp, 'prev');
                            }}
                            disabled={col.id === 'DISCOVERY'}
                            className="cursor-pointer rounded bg-nature-bg p-1 text-nature-text-muted hover:bg-nature-card-dark hover:text-nature-text-primary disabled:opacity-30"
                            title="Mover anterior"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              shiftStage(opp, 'next');
                            }}
                            disabled={col.id === 'LOST'}
                            className="cursor-pointer rounded bg-nature-bg p-1 text-nature-text-muted hover:bg-nature-card-dark hover:text-nature-text-primary disabled:opacity-30"
                            title="Mover proximo"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {levelOpps.length === 0 && (
                    <div className="rounded-xl border border-dashed border-nature-border-light p-6 text-center text-[10px] font-semibold text-nature-text-light">
                      Sem negocios nesta etapa.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedOpportunity && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-nature-border bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-nature-border bg-gradient-to-r from-nature-bg/70 to-white px-6 py-5">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-nature-text-muted">
                  Lead selecionado
                </p>
                <h3 className="mt-2 text-lg font-bold text-nature-text-primary">
                  {selectedOpportunity.name}
                </h3>
                <p className="mt-1 text-sm text-nature-text-muted">
                  {selectedClient.company} • {selectedClient.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedOpportunityId(null)}
                className="rounded-xl p-2 text-nature-text-muted transition-colors hover:bg-nature-bg hover:text-nature-text-primary"
                title="Fechar detalhes"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-88px)] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-nature-border-light bg-nature-bg/20 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-nature-text-muted">
                        Valor
                      </p>
                      <p className="mt-1 font-mono text-2xl font-black text-nature-text-primary">
                        ${selectedOpportunity.value.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-nature-border-light bg-nature-bg/20 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-nature-text-muted">
                        Probabilidade
                      </p>
                      <p className="mt-1 font-mono text-2xl font-black text-nature-text-primary">
                        {selectedOpportunity.probability}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-nature-border-light p-4">
                      <div className="flex items-center gap-2 text-nature-text-secondary">
                        <CircleDot className="h-4 w-4 text-nature-accent" />
                        <span className="text-xs font-bold">Etapa atual</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-nature-text-primary">
                        {stageMeta.title}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-nature-border-light p-4">
                      <div className="flex items-center gap-2 text-nature-text-secondary">
                        <Calendar className="h-4 w-4 text-nature-accent" />
                        <span className="text-xs font-bold">Fechamento previsto</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-nature-text-primary">
                        {formatDate(selectedOpportunity.expectedCloseDate)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-nature-border-light p-4">
                      <div className="flex items-center gap-2 text-nature-text-secondary">
                        <Clock3 className="h-4 w-4 text-nature-accent" />
                        <span className="text-xs font-bold">Primeiro contato</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-nature-text-primary">
                        {firstInteraction
                          ? formatDate(firstInteraction.date)
                          : formatDate(selectedClient.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-nature-border-light p-4">
                      <div className="flex items-center gap-2 text-nature-text-secondary">
                        <History className="h-4 w-4 text-nature-accent" />
                        <span className="text-xs font-bold">Ultimo contato</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-nature-text-primary">
                        {selectedClient.lastContact}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-3xl border border-nature-border-light p-5">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-nature-accent" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-nature-text-secondary">
                        Escopo da oportunidade
                      </h4>
                    </div>
                    <p className="text-sm leading-relaxed text-nature-text-primary">
                      {selectedOpportunity.description ||
                        'Sem descricao detalhada cadastrada para esta oportunidade.'}
                    </p>
                  </div>

                  <div className="space-y-3 rounded-3xl border border-nature-border-light p-5">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-nature-accent" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-nature-text-secondary">
                        Historico recente
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {selectedInteractions.length > 0 ? (
                        selectedInteractions.slice(0, 6).map((interaction) => (
                          <div
                            key={interaction.id}
                            className="rounded-2xl border border-nature-border-light bg-nature-bg/35 p-4 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-bold text-nature-text-secondary">
                                {interaction.summary}
                              </p>
                              <span className="whitespace-nowrap font-mono text-[10px] text-nature-text-muted">
                                {formatDate(interaction.date)}
                              </span>
                            </div>
                            {interaction.details && (
                              <p className="mt-1.5 text-sm leading-relaxed text-nature-text-muted">
                                {interaction.details}
                              </p>
                            )}
                            <span className="mt-2 inline-flex rounded border border-nature-border bg-white px-1.5 py-0.5 text-[10px] font-bold text-nature-text-secondary">
                              {interaction.type}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-nature-text-light">
                          Ainda nao ha interacoes registradas para este lead.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-3 rounded-3xl border border-nature-border-light p-5">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-nature-accent" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-nature-text-secondary">
                        Empresa e lead
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm text-nature-text-primary">
                      <p><span className="font-bold">Empresa:</span> {selectedClient.company}</p>
                      <p><span className="font-bold">Responsavel:</span> {selectedClient.name}</p>
                      <p><span className="font-bold">Setor:</span> {selectedClient.industry}</p>
                      <p><span className="font-bold">Regiao:</span> {selectedClient.region}</p>
                      <p><span className="font-bold">Status:</span> {selectedClient.status}</p>
                      <p><span className="font-bold">Tags:</span> {selectedClient.tags.join(', ')}</p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-3xl border border-nature-border-light p-5">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-nature-accent" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-nature-text-secondary">
                        Contato principal
                      </h4>
                    </div>

                    <div className="space-y-2 text-sm text-nature-text-primary">
                      <div className="flex items-start gap-2">
                        <Phone className="mt-0.5 h-4 w-4 text-nature-text-light" />
                        <span>{selectedClient.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-4 w-4 text-nature-text-light" />
                        <span className="break-all">{selectedClient.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-3xl border border-nature-border-light p-5">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-nature-accent" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-nature-text-secondary">
                        Contatos vinculados
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {selectedContacts.length > 0 ? (
                        selectedContacts.slice(0, 4).map((contact) => (
                          <div key={contact.id} className="rounded-2xl bg-nature-bg/35 p-4">
                            <p className="text-sm font-bold text-nature-text-secondary">
                              {contact.name}
                            </p>
                            <p className="mt-1 text-sm text-nature-text-muted">
                              {contact.position}
                            </p>
                            <p className="mt-1 break-all text-sm text-nature-text-light">
                              {contact.email}
                            </p>
                            <p className="mt-1 text-sm text-nature-text-light">
                              {contact.phone}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-nature-text-light">
                          Nenhum contato adicional vinculado a essa empresa.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-nature-border bg-white shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-nature-border p-5">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-lg border border-nature-border-light bg-nature-bg p-1.5 text-nature-accent">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-nature-text-primary">
                  Cadastrar Oportunidade Comercial
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-nature-text-muted transition-all hover:bg-nature-bg hover:text-nature-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-nature-text-muted">
                  Nome do Projeto / Negocio *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Expansao de Licencas SaaS"
                  value={newOppName}
                  onChange={(event) => setNewOppName(event.target.value)}
                  className="w-full rounded-lg border border-nature-border px-3 py-2 text-xs text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-nature-text-muted">
                  Cliente Vinculado *
                </label>
                {clients.length === 0 ? (
                  <p className="text-[10px] text-red-500">
                    Aviso: Nenhum cliente cadastrado ainda. Cadastre um cliente primeiro.
                  </p>
                ) : (
                  <select
                    value={newClientId}
                    onChange={(event) => setNewClientId(event.target.value)}
                    className="w-full rounded-lg border border-nature-border bg-white py-2 pl-3 pr-8 text-xs text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent"
                    required
                  >
                    <option value="">-- Selecione o cliente comercial --</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company} ({client.name})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-nature-text-muted">
                    Valor Estimado *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-nature-text-light">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="Ex: 50000"
                      value={newValue}
                      onChange={(event) => setNewValue(event.target.value)}
                      className="w-full rounded-lg border border-nature-border py-2 pl-7 pr-3 text-xs text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-nature-text-muted">
                    Etapa Atual
                  </label>
                  <select
                    value={newStage}
                    onChange={(event) => setNewStage(event.target.value as OpportunityStage)}
                    className="w-full rounded-lg border border-nature-border bg-white py-2 pl-3 pr-8 text-xs text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-nature-text-secondary">
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Probabilidade de fechamento
                  </span>
                  <span className="font-mono font-bold text-nature-accent">
                    {newProbability}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newProbability}
                  onChange={(event) => setNewProbability(Number(event.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-nature-bg accent-nature-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-nature-text-muted">
                  Data de Fechamento Prevista
                </label>
                <input
                  type="date"
                  value={newCloseDate}
                  onChange={(event) => setNewCloseDate(event.target.value)}
                  className="w-full rounded-lg border border-nature-border px-3 py-2 text-xs text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-nature-text-muted">
                  Detalhamento da Proposta / Escopo
                </label>
                <textarea
                  placeholder="Descreva os detalhes, entregas e contexto do lead..."
                  rows={3}
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  className="w-full rounded-lg border border-nature-border px-3 py-2 text-xs text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 border-t border-nature-border pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-nature-text-muted transition-colors hover:bg-nature-bg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-nature-accent px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-nature-accent-hover"
                >
                  Salvar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
