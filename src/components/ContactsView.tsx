import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Contact } from '../types/crm';
import { Users2, Plus, Mail, Phone, Building, Search, Trash2, X, Info } from 'lucide-react';
import WhatsAppChatModal, { WhatsAppIcon } from './WhatsAppChatModal';

export default function ContactsView() {
  const { contacts, clients, addContact, deleteContact } = useCRM();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('');
  
  // Modal for addition
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // WhatsApp internal chat modal state
  const [selectedChatContact, setSelectedChatContact] = useState<Contact | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const handleOpenWhatsApp = (contact: Contact) => {
    setSelectedChatContact(contact);
    setIsWhatsAppOpen(true);
  };

  // Extract non-duplicate client entities for selector dropdown
  const filteredContacts = contacts.filter(co => {
    const parentClient = clients.find(c => c.id === co.clientId);
    const companyName = parentClient ? parentClient.company : '';
    
    const matchesSearch = 
      co.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      co.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      co.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = selectedCompanyFilter ? co.clientId === selectedCompanyFilter : true;

    return matchesSearch && matchesCompany;
  });

  const handleCreateContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !email) {
      alert('Nome, Cliente e E-mail são obrigatórios.');
      return;
    }

    addContact({
      clientId,
      name,
      position: position || 'Corporate Contact',
      phone: phone || '+1 (555) 000-0000',
      email,
      notes
    });

    // Reset Form fields
    setName('');
    setClientId('');
    setPosition('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 font-sans">
      
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Contacts Ledger
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Keep track of specific human contact points, hierarchy titles, and communication logs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 font-semibold text-xs text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Corporate Contact</span>
        </button>
      </div>

      {/* Filters ledger */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contact name, position, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-gray-50/20 text-gray-800"
          />
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest font-mono select-none">
            Filter Organization:
          </label>
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="pl-3 pr-8 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 bg-white"
          >
            <option value="">All Companies</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.company}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContacts.map((contact) => {
          const parentCompany = clients.find(c => c.id === contact.clientId);
          const initials = contact.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() || 'CO';

          return (
            <div 
              key={contact.id} 
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between group"
            >
              <div>
                {/* Header initials and Delete action */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center border border-blue-100">
                      {initials}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {contact.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">
                        {contact.position}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remove contact ${contact.name}?`)) {
                        deleteContact(contact.id);
                      }
                    }}
                    className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Excluir Contato"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Company Link and details */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Building className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="font-bold text-gray-700 truncate">
                      {parentCompany ? parentCompany.company : 'Individual Lead'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline font-mono truncate">
                      {contact.email}
                    </a>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="font-mono text-gray-500 font-medium">
                      {contact.phone}
                    </span>
                  </div>
                </div>
              </div>

              {contact.notes && (
                <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 font-medium leading-relaxed italic">
                  Note: "{contact.notes}"
                </div>
              )}

              {/* WHATSAPP INTERNAL CHAT ACTION */}
              <button
                onClick={() => handleOpenWhatsApp(contact)}
                className="mt-4 w-full inline-flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-[#005c4b] hover:text-[#004d3e] border border-emerald-200/60 font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                <span>Chat WhatsApp</span>
              </button>
            </div>
          );
        })}

        {filteredContacts.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-xs text-gray-400 font-semibold">
            Nenhum contato corporativo localizado com os critérios definidos.
          </div>
        )}
      </div>

      {/* CREATE DIALOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Users2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  Cadastrar Contato Corporativo
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
            <form onSubmit={handleCreateContactSubmit} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Robert Downey Jr"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Client Picker for setting client link */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  Empresa / Cliente Comercial Mapeado *
                </label>
                {clients.length === 0 ? (
                  <p className="text-[10px] text-red-500">
                    Aviso: Cadastre um cliente primeiro no CRM!
                  </p>
                ) : (
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-lg text-gray-700 bg-white"
                    required
                  >
                    <option value="">-- Selecione a empresa do contato --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  Cargo / Hierarquia (Position)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Diretor de Tecnologia (CTO)"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                    Telefone Direto
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                    E-mail do Contato *
                  </label>
                  <input
                    type="email"
                    placeholder="cto@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest block mb-1">
                  Notas de Observação Interna
                </label>
                <textarea
                  placeholder="Instruções de contato ou preferências particulares..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Action feet */}
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
                  Salvar Contato
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
