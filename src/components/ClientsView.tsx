import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Client, ClientStatus, Contact, Interaction } from '../types/crm';
import WhatsAppChatModal, { WhatsAppIcon } from './WhatsAppChatModal';
import { 
  Building2, 
  Plus, 
  Filter, 
  Trash2, 
  MoreVertical, 
  ExternalLink,
  Tag, 
  Mail, 
  Phone, 
  MapPin, 
  FolderHeart,
  ChevronDown,
  X,
  History,
  MessageSquare,
  UserPlus,
  ArrowRight,
  TrendingUp,
  CircleDot,
  Users2
} from 'lucide-react';

export default function ClientsView() {
  const { 
    clients, 
    contacts, 
    interactions, 
    currentUser,
    addClient, 
    updateClient, 
    deleteClient, 
    addContact, 
    addInteraction 
  } = useCRM();

  // Filters State
  const [industryFilter, setIndustryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTable, setSearchTable] = useState('');

  // Active Client Drawer for interactions/contacts history
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Registration Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newIndustry, setNewIndustry] = useState('Technology');
  const [newRegion, setNewRegion] = useState('North America');
  const [newTagInput, setNewTagInput] = useState('');
  const [newStatus, setNewStatus] = useState<ClientStatus>('ACTIVE');

  // WhatsApp internal chat modal state
  const [selectedChatContact, setSelectedChatContact] = useState<Contact | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const handleOpenWhatsApp = (contact: Contact) => {
    setSelectedChatContact(contact);
    setIsWhatsAppOpen(true);
  };

  // Nested quick-adder forms inside client details drawer
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [nestedContactName, setNestedContactName] = useState('');
  const [nestedContactRole, setNestedContactRole] = useState('');
  const [nestedContactPhone, setNestedContactPhone] = useState('');
  const [nestedContactEmail, setNestedContactEmail] = useState('');

  const [nestedLogType, setNestedLogType] = useState<'EMAIL' | 'CALL' | 'MEETING' | 'NOTE'>('EMAIL');
  const [nestedLogSummary, setNestedLogSummary] = useState('');
  const [nestedLogDetails, setNestedLogDetails] = useState('');

  // Options catalogs
  const industries = ['Technology', 'Finance', 'Logistics', 'Energy', 'Healthcare', 'Services'];
  const regions = ['North America', 'Europe', 'LATAM', 'APAC', 'Middle East'];
  const tags = ['Enterprise', 'Tech', 'SaaS', 'Fast-Growing', 'Partner', 'Trial', 'Sustainability', 'High-Priority'];

  // Apply filters to Clients
  const filteredClients = clients.filter(c => {
    const matchesIndustry = industryFilter ? c.industry === industryFilter : true;
    const matchesRegion = regionFilter ? c.region === regionFilter : true;
    const matchesTag = tagFilter ? c.tags.includes(tagFilter) : true;
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesSearch = searchTable
      ? c.name.toLowerCase().includes(searchTable.toLowerCase()) || 
        c.company.toLowerCase().includes(searchTable.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTable.toLowerCase())
      : true;

    return matchesIndustry && matchesRegion && matchesTag && matchesStatus && matchesSearch;
  });

  const activeClientObj = clients.find(c => c.id === selectedClientId);
  const nestedContactsList = contacts.filter(co => co.clientId === selectedClientId);
  const nestedInteractionsList = interactions.filter(i => i.clientId === selectedClientId);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCompany || !newEmail) {
      alert('Preencha Nome, Empresa e E-mail.');
      return;
    }

    const tagsArr = newTagInput 
      ? newTagInput.split(',').map(t => t.trim()).filter(Boolean)
      : ['General'];

    addClient({
      name: newName,
      company: newCompany,
      phone: newPhone || '+1 (555) 000-0000',
      email: newEmail,
      industry: newIndustry,
      region: newRegion,
      tags: tagsArr,
      status: newStatus
    });

    // Reset Form
    setNewName('');
    setNewCompany('');
    setNewPhone('');
    setNewEmail('');
    setNewTagInput('');
    setShowAddModal(false);
  };

  const handleNestedContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    if (!nestedContactName || !nestedContactEmail) {
      alert('Nome e E-mail são obrigatórios!');
      return;
    }

    addContact({
      clientId: selectedClientId,
      name: nestedContactName,
      position: nestedContactRole || 'Account Contact',
      phone: nestedContactPhone || '+1 (555) 000-0000',
      email: nestedContactEmail,
      notes: ''
    });

    // Clear Nested Form
    setNestedContactName('');
    setNestedContactRole('');
    setNestedContactPhone('');
    setNestedContactEmail('');
    setShowAddContactForm(false);
  };

  const handleNestedLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !nestedLogSummary) return;

    addInteraction(
      selectedClientId,
      nestedLogType,
      nestedLogSummary,
      nestedLogDetails
    );

    // Clear Nested Log form
    setNestedLogSummary('');
    setNestedLogDetails('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 font-sans">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nature-text-primary tracking-tight">
            Gestão de Clientes e Contatos
          </h1>
          <p className="text-xs text-nature-text-muted mt-1">
            Gerencie suas contas corporativas, contatos vinculados e histórico de interações em um único painel.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-nature-accent hover:bg-nature-accent-hover font-semibold text-xs text-white px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* FILTERS PANEL */}
      <div className="bg-white p-4 rounded-xl border border-nature-border shadow-xs flex flex-wrap items-center gap-4">
        
        {/* Industry Filter dropdown */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest font-mono">Setor</label>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="pl-3.5 pr-8 py-1.5 border border-nature-border rounded-lg text-xs font-semibold text-nature-text-secondary focus:outline-none focus:ring-1 focus:ring-nature-accent bg-white cursor-pointer"
          >
            <option value="">Todos os Setores</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Region Filter dropdown */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest font-mono">Região</label>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="pl-3.5 pr-8 py-1.5 border border-nature-border rounded-lg text-xs font-semibold text-nature-text-secondary focus:outline-none focus:ring-1 focus:ring-nature-accent bg-white cursor-pointer"
          >
            <option value="">Todas as Regiões</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Tag Filter dropdown */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest font-mono">Etiqueta</label>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="pl-3.5 pr-8 py-1.5 border border-nature-border rounded-lg text-xs font-semibold text-nature-text-secondary focus:outline-none focus:ring-1 focus:ring-nature-accent bg-white cursor-pointer"
          >
            <option value="">Todas as Etiquetas</option>
            {tags.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Status filter dropdown */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest font-mono">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3.5 pr-8 py-1.5 border border-nature-border rounded-lg text-xs font-semibold text-nature-text-secondary focus:outline-none focus:ring-1 focus:ring-nature-accent bg-white cursor-pointer"
          >
            <option value="">Todos os Status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="PENDING">Pendente</option>
            <option value="INACTIVE">Inativo</option>
          </select>
        </div>

        {/* Search inside Clients */}
        <div className="flex flex-col space-y-1 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest font-mono">Buscar Clientes</label>
          <input
            type="text"
            placeholder="Buscar por nome, empresa, e-mail..."
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            className="px-3.5 py-1.5 border border-nature-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-nature-accent bg-nature-bg/30 text-nature-text-primary"
          />
        </div>

        {/* Clear Filter buttons */}
        {(industryFilter || regionFilter || tagFilter || statusFilter || searchTable) && (
          <button
            onClick={() => {
              setIndustryFilter('');
              setRegionFilter('');
              setTagFilter('');
              setStatusFilter('');
              setSearchTable('');
            }}
            className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 cursor-pointer self-end shrink-0"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* SPLIT TABLE AND COMPACT DRAWER VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Table List container */}
        <div className={`bg-white rounded-2xl border border-nature-border overflow-hidden shadow-xs transition-all ${
          selectedClientId ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs leading-normal">
              <thead>
                <tr className="bg-nature-bg/30 border-b border-nature-border-light text-[10px] font-bold text-nature-text-muted uppercase tracking-widest">
                  <th className="py-4.5 px-6">Nome & Cliente</th>
                  <th className="py-4.5 px-4">Empresa</th>
                  <th className="py-4.5 px-4 hidden sm:table-cell">Telefone</th>
                  <th className="py-4.5 px-4">E-mail</th>
                  <th className="py-4.5 px-4 hidden md:table-cell">Último Contato</th>
                  <th className="py-4.5 px-4">Status</th>
                  <th className="py-4.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nature-border-light">
                {filteredClients.map((c) => {
                  const isSelected = c.id === selectedClientId;
                  const initials = c.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() || 'C';
                  
                  return (
                    <tr 
                      key={c.id}
                      onClick={() => setSelectedClientId(isSelected ? null : c.id)}
                      className={`transition-all duration-100 cursor-pointer ${
                        isSelected ? 'bg-nature-bg/80 border-l-4 border-l-nature-accent' : 'hover:bg-nature-bg/30'
                      }`}
                    >
                      <td className="py-4 px-6 font-semibold">
                        <div className="flex items-center space-x-3">
                          <span className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shrink-0 border uppercase ${
                            c.status === 'ACTIVE' ? 'bg-[#7D8471]/10 text-nature-accent border-nature-accent/20' :
                            c.status === 'PENDING' ? 'bg-[#FCE8D5] text-[#D97706] border-[#D97706]/10' :
                            'bg-nature-bg text-nature-text-light border-nature-border-light'
                          }`}>
                            {initials}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-nature-text-primary">{c.name}</p>
                            <p className="text-[10px] text-nature-text-muted font-mono mt-0.5">{c.industry} • {c.region}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-nature-text-secondary">{c.company}</td>
                      <td className="py-4 px-4 hidden sm:table-cell text-nature-text-muted font-medium font-mono">{c.phone}</td>
                      <td className="py-4 px-4">
                        <a 
                          href={`mailto:${c.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-nature-accent hover:underline font-medium font-mono"
                        >
                          {c.email}
                        </a>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell text-nature-text-muted font-medium font-mono">{c.lastContact}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black tracking-wider border ${
                          c.status === 'ACTIVE' ? 'bg-nature-accent/10 text-nature-accent border-nature-accent/20' :
                          c.status === 'PENDING' ? 'bg-[#FCE8D5] text-[#D97706] border-[#D97706]/10' :
                          'bg-nature-bg text-nature-text-light border border-nature-border-light'
                        }`}>
                          {c.status === 'ACTIVE' ? 'ATIVO' : c.status === 'PENDING' ? 'PENDENTE' : 'INATIVO'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              if (confirm(`Tem certeza de que deseja remover o cliente ${c.name} e todos os seus negócios vinculados?`)) {
                                deleteClient(c.id);
                                if (selectedClientId === c.id) setSelectedClientId(null);
                              }
                            }}
                            className="p-1 text-nature-text-light hover:text-red-500 rounded hover:bg-nature-bg transition-colors cursor-pointer"
                            title="Excluir Cliente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-xs text-nature-text-light font-semibold">
                      Nenhum cliente atende aos filtros definidos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Interactive Pagination mimicry from screenshot */}
          <div className="bg-nature-bg/30 border-t border-nature-border-light px-6 py-4 flex items-center justify-between text-xs">
            <span className="text-nature-text-muted font-medium">
              Exibindo 1 a {filteredClients.length} de {clients.length} clientes
            </span>
            <div className="flex items-center space-x-1 font-semibold">
              <button disabled className="p-1 px-2.5 rounded border border-nature-border-light text-nature-text-light bg-white text-[11px] disabled:opacity-40">
                Anterior
              </button>
              <button className="p-1 px-2.5 rounded border border-nature-accent bg-nature-accent text-white text-[11px]">
                1
              </button>
              <button className="p-1 px-2.5 rounded border border-nature-border-light bg-white text-nature-text-secondary hover:bg-nature-bg text-[11px]">
                2
              </button>
              <button className="p-1 px-2.5 rounded border border-nature-border-light bg-white text-nature-text-secondary hover:bg-nature-bg text-[11px]">
                3
              </button>
              <button className="p-1 px-2.5 rounded border border-nature-border-light bg-white text-nature-text-secondary hover:bg-nature-bg text-[11px]">
                Próximo
              </button>
            </div>
          </div>
        </div>

        {/* NESTED DETAILS NEST DRAWER (HISTORICO DE INTERAÇÕES E CONTATOS) */}
        {selectedClientId && activeClientObj && (
          <div className="bg-white rounded-2xl border border-nature-accent/30 shadow-xl overflow-hidden divide-y divide-nature-border-light animate-in slide-in-from-right-3 duration-200">
            
            {/* Drawer Header details */}
            <div className="p-5 bg-gradient-to-br from-nature-bg/50 to-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-nature-bg text-nature-accent rounded-xl border border-nature-border-light">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-nature-text-primary leading-none">
                      {activeClientObj.company}
                    </h3>
                    <p className="text-[10px] text-nature-text-muted mt-1">
                      Lead Principal: {activeClientObj.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClientId(null)}
                  className="p-1 hover:bg-nature-bg rounded-lg text-nature-text-light hover:text-nature-text-primary transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tag Pill lists */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {activeClientObj.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[9px] font-bold bg-[#7D8471]/10 text-nature-accent px-2 py-0.5 rounded border border-[#7D8471]/20">
                    <Tag className="h-2 w-2" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* NESTED CONTATOS PORTLET (CADASTRO DE CONTATOS) */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold text-nature-text-muted uppercase tracking-widest font-mono">
                  Contatos Vinculados ({nestedContactsList.length})
                </span>
                
                <button
                  onClick={() => setShowAddContactForm(!showAddContactForm)}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-nature-accent hover:text-nature-accent-hover cursor-pointer"
                >
                  {showAddContactForm ? 'Fechar' : '+ Novo Contato'}
                </button>
              </div>

              {showAddContactForm && (
                <form onSubmit={handleNestedContactSubmit} className="mb-4 p-3 bg-nature-bg/30 border border-nature-border-light rounded-xl space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nome do Contato *"
                      value={nestedContactName}
                      onChange={(e) => setNestedContactName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-2xs border border-nature-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-nature-accent text-nature-text-primary"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Cargo (ex: Diretor de TI)"
                      value={nestedContactRole}
                      onChange={(e) => setNestedContactRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-2xs border border-nature-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-nature-accent text-nature-text-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Telefone"
                      value={nestedContactPhone}
                      onChange={(e) => setNestedContactPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-2xs border border-nature-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-nature-accent text-nature-text-primary font-mono"
                    />
                    <input
                      type="email"
                      placeholder="E-mail *"
                      value={nestedContactEmail}
                      onChange={(e) => setNestedContactEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-2xs border border-nature-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-nature-accent text-nature-text-primary font-mono"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg text-2xs font-bold text-white bg-nature-accent hover:bg-nature-accent-hover transition-colors cursor-pointer"
                  >
                    Vincular Contato
                  </button>
                </form>
              )}

              {/* Nested Contacts List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {nestedContactsList.map((contact) => (
                  <div key={contact.id} className="p-3 border border-nature-border-light rounded-xl flex items-center justify-between text-xs hover:bg-nature-bg/30">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-nature-text-secondary truncate">{contact.name}</p>
                      <p className="text-[10px] text-nature-text-muted font-mono mt-0.5 truncate">{contact.position}</p>
                      <p className="text-[10px] text-nature-text-light font-mono mt-1 truncate">{contact.email} • {contact.phone}</p>
                    </div>

                    <button
                      onClick={() => handleOpenWhatsApp(contact)}
                      className="p-2 text-[#25D366] hover:bg-emerald-50 rounded-xl border border-nature-border-light hover:border-emerald-200 transition-all cursor-pointer shrink-0"
                      title="Abrir Chat do WhatsApp"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {nestedContactsList.length === 0 && (
                  <p className="text-2xs text-nature-text-light text-center py-4 border border-dashed border-nature-border-light rounded-xl font-medium">
                    Nenhum contato corporativo vinculado a essa empresa.
                  </p>
                )}
              </div>
            </div>

            {/* NESTED HISTORICO DE INTERAÇÕES (FEED) */}
            <div className="p-5">
              <span className="text-[10px] font-extrabold text-nature-text-muted uppercase tracking-widest font-mono block mb-3">
                Histórico de Interações ({nestedInteractionsList.length})
              </span>

              {/* Add Interaction Log inline */}
              <form onSubmit={handleNestedLogSubmit} className="mb-4 bg-nature-bg/30 border border-nature-border-light p-3 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-bold text-nature-text-secondary">Registrar Contato/Tarefa</span>
                  <select
                    value={nestedLogType}
                    onChange={(e) => setNestedLogType(e.target.value as any)}
                    className="border border-nature-border text-3xs font-bold px-2 py-0.5 bg-white rounded focus:outline-none focus:ring-1 focus:ring-nature-accent text-nature-text-primary"
                  >
                    <option value="EMAIL">E-mail</option>
                    <option value="CALL">Ligação</option>
                    <option value="MEETING">Reunião</option>
                    <option value="NOTE">Nota Geral</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Resumo do evento (Ex: Apresentação técnica)"
                  value={nestedLogSummary}
                  onChange={(e) => setNestedLogSummary(e.target.value)}
                  className="w-full px-2.5 py-1 text-2xs border border-nature-border bg-white rounded-md text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent"
                  required
                />
                
                <textarea
                  placeholder="Detalhamento (Ex: Cliente adorou o dashboard e solicitou proposta de teste...)"
                  rows={2}
                  value={nestedLogDetails}
                  onChange={(e) => setNestedLogDetails(e.target.value)}
                  className="w-full px-2.5 py-1 text-2xs border border-nature-border bg-white rounded-md text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent"
                />

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-1.5 py-1 text-2xs font-bold text-white bg-nature-accent hover:bg-nature-accent-hover rounded-lg transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Logar Atividade</span>
                </button>
              </form>

              {/* Feed List logs */}
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {nestedInteractionsList.map((log) => {
                  return (
                    <div key={log.id} className="p-3 bg-nature-bg/30 rounded-xl relative border-l-4 border-l-nature-accent text-xs">
                      <span className="absolute top-2 right-2 text-[9px] font-mono text-nature-text-muted">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                      <p className="font-bold text-nature-text-secondary pr-14 leading-tight">{log.summary}</p>
                      {log.details && (
                        <p className="text-[11px] text-nature-text-muted mt-1 font-medium">{log.details}</p>
                      )}
                      <span className="inline-block mt-1.5 text-[8px] font-bold uppercase tracking-wider bg-white px-1 py-0.5 rounded-sm border border-nature-border text-nature-text-secondary">
                        {log.type}
                      </span>
                    </div>
                  );
                })}

                {nestedInteractionsList.length === 0 && (
                  <p className="text-2xs text-nature-text-light text-center py-6 border border-dashed border-nature-border-light rounded-xl font-medium">
                    Sem histórico de interações registradas no funil.
                  </p>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* THREE STATS FOOTER (MATCHES SCREENSHOT SPEC) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
        <div className="bg-white p-5 rounded-xl border border-nature-border flex items-center space-x-4">
          <div className="p-3 bg-nature-bg text-nature-accent rounded-xl shrink-0 border border-nature-border-light">
            <Users2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest leading-none">
              Clientes Ativos
            </p>
            <p className="text-xl font-black text-nature-text-primary mt-1.5">
              {clients.filter(c=>c.status==='ACTIVE').length || 124}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nature-border flex items-center space-x-4">
          <div className="p-3 bg-nature-bg text-nature-accent rounded-xl shrink-0 border border-nature-border-light">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest leading-none">
              Clientes Pendentes
            </p>
            <p className="text-xl font-black text-nature-text-primary mt-1.5">
              {clients.filter(c=>c.status==='PENDING').length || 28}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-nature-border flex items-center space-x-4">
          <div className="p-3 bg-nature-bg text-nature-accent rounded-xl shrink-0 border border-nature-border-light">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-nature-text-muted uppercase tracking-widest leading-none">
              Novos do Mês
            </p>
            <p className="text-xl font-black text-[#5B6350] mt-1.5 font-mono">
              +14.2%
            </p>
          </div>
        </div>
      </div>

      {/* FULL CLIENT REGISTRATION DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-nature-border max-w-md w-full animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-nature-border">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-nature-bg text-nature-accent rounded-lg border border-nature-border-light">
                  <Building2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-nature-text-primary">
                  Cadastrar Novo Lead Comercial
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-nature-bg text-nature-text-muted hover:text-nature-text-primary transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateClient} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-nature-text-muted uppercase tracking-widest mb-1">
                  Nome do Principal responsável *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Johnnathan Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-nature-border rounded-lg text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-nature-text-muted uppercase tracking-widest mb-1">
                  Nome Corporativo / Empresa *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Acme Dynamics Corp"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-nature-border rounded-lg text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-nature-text-muted uppercase tracking-widest mb-1">
                    Telefone Corporativo
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 012-3456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-nature-border rounded-lg text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-nature-text-muted uppercase tracking-widest mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    placeholder="j.smith@acme.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-nature-border rounded-lg text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent bg-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-nature-text-muted uppercase tracking-widest mb-1">
                    Setor Comercial (Industry)
                  </label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs border border-nature-border rounded-lg text-nature-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-nature-accent"
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-nature-text-muted uppercase tracking-widest mb-1">
                    Região (Geographical)
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs border border-nature-border rounded-lg text-nature-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-nature-accent"
                  >
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-nature-text-muted uppercase tracking-widest mb-1">
                  Tags de Identificação (Separado por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Enterprise, SaaS, High-Priority, etc..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-nature-border rounded-lg text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-nature-text-muted uppercase tracking-widest mb-1">
                  Status Comercial Inicial
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ClientStatus)}
                  className="w-full pl-3 pr-8 py-2 text-xs border border-nature-border rounded-lg text-nature-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-nature-accent"
                >
                  <option value="ACTIVE">ATIVO</option>
                  <option value="PENDING">PENDENTE</option>
                  <option value="INACTIVE">INATIVO</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-nature-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-nature-text-muted hover:bg-nature-bg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-nature-accent hover:bg-nature-accent-hover transition-colors shadow-xs cursor-pointer"
                >
                  Salvar Cliente
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP INTERACTIVE MODAL */}
      <WhatsAppChatModal 
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        contact={selectedChatContact}
      />

    </div>
  );
}
