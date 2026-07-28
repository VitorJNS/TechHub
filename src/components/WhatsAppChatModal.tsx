import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '../types/crm';
import { 
  X, Send, Phone, Video, Search, MessageSquare, 
  Check, CheckCheck, Smile, Paperclip, MoreVertical, Sparkles, CornerDownLeft,
  Settings, Key, AlertTriangle, Cpu, Globe, Info, RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'me' | 'contact';
  text: string;
  time: string;
  timestamp?: number;
}

interface WhatsAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
}

// WhatsApp brand icon SVG
export const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function WhatsAppChatModal({ isOpen, onClose, contact }: WhatsAppChatModalProps) {
  // Modes: 'simulated' (local state & bot replies) or 'official' (Meta Cloud API)
  const [apiMode, setApiMode] = useState<'simulated' | 'official'>('simulated');
  
  // Simulated Mode State
  const [simulatedMessages, setSimulatedMessages] = useState<ChatMessage[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  // Official Mode State
  const [apiConfig, setApiConfig] = useState<{
    isConfigured: boolean;
    webhookUrl: string;
    verifyToken: string;
    hasPhoneId: boolean;
    hasToken: boolean;
  } | null>(null);
  const [realMessages, setRealMessages] = useState<ChatMessage[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSendingReal, setIsSendingReal] = useState(false);
  
  // Common UI State
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick text templates
  const templateChips = [
    { label: "📋 Proposta", text: "Olá! Conforme alinhamos em nosso contato, segue em anexo o escopo e a nossa proposta comercial detalhada para análise." },
    { label: "📅 Agendar Call", text: "Olá! Conseguimos agendar uma rápida call de 15 minutos esta semana para repassarmos as dúvidas do projeto? Qual horário prefere?" },
    { label: "💰 Desconto", text: "Olá! Gostaria de compartilhar que consegui liberar um desconto especial de 10% com nossa gerência para fechamento do projeto essa semana." },
    { label: "👍 Agradecimento", text: "Muito obrigado pelo seu tempo em nossa ligação de hoje! Qualquer dúvida extra sobre os termos, sigo inteiramente à disposição por aqui." },
  ];

  // Check backend configuration on open
  const checkConfig = () => {
    fetch("/api/whatsapp/config")
      .then(res => res.json())
      .then(data => {
        setApiConfig(data);
        if (data.isConfigured) {
          setApiMode('official');
        } else {
          setApiMode('simulated');
        }
      })
      .catch(err => console.error("Erro ao verificar configuração de WhatsApp:", err));
  };

  useEffect(() => {
    if (isOpen) {
      checkConfig();
    }
  }, [isOpen]);

  // Load simulated history on contact change
  useEffect(() => {
    if (!isOpen || !contact) return;

    const storageKey = `whatsapp_chat_${contact.id}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setSimulatedMessages(JSON.parse(saved));
      } catch (e) {
        generateDefaultSimulatedMessages();
      }
    } else {
      generateDefaultSimulatedMessages();
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  }, [contact, isOpen]);

  // Poll official WhatsApp messages from backend when in official mode
  useEffect(() => {
    if (!isOpen || !contact || apiMode !== 'official') return;

    const fetchRealHistory = () => {
      fetch(`/api/whatsapp/history?phone=${encodeURIComponent(contact.phone || '')}`)
        .then(res => res.json())
        .then(data => {
          if (data.history) {
            setRealMessages(data.history);
          }
        })
        .catch(err => console.error("Erro ao carregar histórico real:", err));
    };

    fetchRealHistory();
    const interval = setInterval(fetchRealHistory, 4000); // Poll every 4 seconds

    return () => clearInterval(interval);
  }, [isOpen, contact, apiMode]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simulatedMessages, realMessages, isBotTyping, isSendingReal, apiMode]);

  if (!isOpen || !contact) return null;

  const generateDefaultSimulatedMessages = () => {
    const formattedTime = (offsetHours: number) => {
      const d = new Date();
      d.setHours(d.getHours() - offsetHours);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const initial: ChatMessage[] = [
      {
        id: 'msg-1',
        sender: 'contact',
        text: `Olá! Sou o ${contact.name}. Gostaria de tirar algumas dúvidas sobre a proposta comercial que enviaram.`,
        time: formattedTime(3)
      },
      {
        id: 'msg-2',
        sender: 'me',
        text: `Olá, ${contact.name}! Prazer enorme falar com você. O nosso faturamento integrado já está incluso no plano premium. Vamos agendar uma call rápida?`,
        time: formattedTime(2)
      },
      {
        id: 'msg-3',
        sender: 'contact',
        text: 'Excelente! Pode me mandar as opções de horários, por favor.',
        time: formattedTime(1)
      }
    ];

    setSimulatedMessages(initial);
    localStorage.setItem(`whatsapp_chat_${contact.id}`, JSON.stringify(initial));
  };

  const getBotReply = (userMessage: string): string => {
    const text = userMessage.toLowerCase();
    
    if (text.includes('proposta') || text.includes('valores') || text.includes('preço') || text.includes('orcamento') || text.includes('orçamento') || text.includes('desconto')) {
      return `Perfeito! Vou encaminhar para a nossa equipe financeira validar as melhores condições comerciais para você.`;
    }
    
    if (text.includes('reunião') || text.includes('call') || text.includes('agenda') || text.includes('conversar') || text.includes('agendar') || text.includes('ligar')) {
      return `Excelente! Quinta-feira às 14h ou sexta-feira às 10h funciona bem para você?`;
    }
    
    if (text.includes('obrigado') || text.includes('vlw') || text.includes('valeu') || text.includes('obrigada') || text.includes('agradeço')) {
      return `Imagina, ${contact.name}! Qualquer outra dúvida, sigo inteiramente à disposição.`;
    }

    const replies = [
      `Entendido perfeitamente. Vou verificar essa informação aqui e te dou um retorno em instantes.`,
      `Ótimo retorno! Vou registrar essas observações na ficha do cliente para alinharmos em nossa próxima reunião.`,
      `Obrigado pelo feedback super rápido. Sigo acompanhando!`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  // Handler for sending messages in Simulated Mode
  const handleSendSimulated = (textToSend: string) => {
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'me',
      text: textToSend,
      time: currentTime
    };

    const updated = [...simulatedMessages, userMsg];
    setSimulatedMessages(updated);
    localStorage.setItem(`whatsapp_chat_${contact.id}`, JSON.stringify(updated));
    setInputText('');

    setIsBotTyping(true);
    setTimeout(() => {
      const botMsgText = getBotReply(textToSend);
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'contact',
        text: botMsgText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      const nextUpdated = [...updated, botMsg];
      setSimulatedMessages(nextUpdated);
      localStorage.setItem(`whatsapp_chat_${contact.id}`, JSON.stringify(nextUpdated));
      setIsBotTyping(false);
    }, 1800);
  };

  // Handler for sending messages in Official Meta Cloud API Mode
  const handleSendOfficial = async (textToSend: string) => {
    setIsSendingReal(true);
    setApiError(null);

    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone: contact.phone,
          text: textToSend
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro desconhecido ao enviar via WhatsApp API.");
      }

      setInputText('');
      // Optimistically append sent message
      if (data.data) {
        setRealMessages(prev => [...prev, data.data]);
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Não foi possível enviar a mensagem real.");
    } finally {
      setIsSendingReal(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (apiMode === 'official') {
      handleSendOfficial(inputText);
    } else {
      handleSendSimulated(inputText);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Deseja limpar o histórico de conversas deste contato?')) {
      if (apiMode === 'official') {
        setRealMessages([]);
      } else {
        localStorage.removeItem(`whatsapp_chat_${contact.id}`);
        setSimulatedMessages([]);
      }
    }
  };

  const currentMessages = apiMode === 'official' ? realMessages : simulatedMessages;

  const filteredMessages = currentMessages.filter(m => 
    m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contactInitials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CO';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      
      {/* WhatsApp Window Wrapper */}
      <div className="bg-white rounded-2xl shadow-2xl border border-nature-border max-w-xl w-full h-[680px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* GREEN WHATSAPP HEADER */}
        <div className="bg-[#005c4b] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            {/* Contact Avatar */}
            <div className="relative">
              <span className="w-10 h-10 rounded-full bg-white/20 text-white font-extrabold text-xs flex items-center justify-center border border-white/10 uppercase">
                {contactInitials}
              </span>
              <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#005c4b] rounded-full ${
                apiMode === 'official' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
            </div>
            
            {/* Name and State */}
            <div>
              <h3 className="text-sm font-bold tracking-wide leading-tight">
                {contact.name}
              </h3>
              <p className="text-[10px] text-emerald-200 font-medium font-mono">
                {apiMode === 'official' 
                  ? 'Canal Oficial Conectado' 
                  : (isBotTyping ? 'digitando...' : 'online (Modo Simulado)')}
              </p>
            </div>
          </div>

          {/* Mode Selector and Action Icons */}
          <div className="flex items-center space-x-3 text-white/90">
            
            {/* MODE SWITCHER */}
            <div className="bg-white/10 p-0.5 rounded-lg flex items-center border border-white/10 mr-2">
              <button
                type="button"
                onClick={() => setApiMode('simulated')}
                className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                  apiMode === 'simulated'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
                title="Simulador de atendimento"
              >
                Simulador
              </button>
              <button
                type="button"
                onClick={() => {
                  setApiMode('official');
                  setApiError(null);
                }}
                className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all cursor-pointer flex items-center space-x-1 ${
                  apiMode === 'official'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
                title="WhatsApp Oficial Meta API"
              >
                <WhatsAppIcon className="h-2.5 w-2.5" />
                <span>Oficial</span>
              </button>
            </div>

            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={`p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer ${showSearch ? 'bg-white/15' : ''}`}
              title="Buscar na conversa"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={handleClearHistory}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-red-200 hover:text-red-300 animate-pulse"
              title="Limpar Conversa"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        {showSearch && (
          <div className="bg-nature-bg border-b border-nature-border px-3.5 py-2 flex items-center justify-between shrink-0 animate-in slide-in-from-top duration-150">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-nature-text-muted" />
              <input 
                type="text"
                placeholder="Filtrar mensagens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs border border-nature-border rounded-lg focus:outline-none bg-white text-nature-text-primary"
              />
            </div>
            <button 
              onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              className="ml-2.5 text-xs text-nature-text-muted hover:text-nature-text-primary font-bold"
            >
              Fechar
            </button>
          </div>
        )}

        {/* API STATUS / INFORMATION PORTLET */}
        {apiMode === 'official' && apiConfig && (
          <div className={`border-b px-4 py-2 text-xs flex items-center justify-between shrink-0 transition-all ${
            apiConfig.isConfigured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center space-x-2">
              <Cpu className={`h-4.5 w-4.5 ${apiConfig.isConfigured ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`} />
              <span className="font-semibold">
                {apiConfig.isConfigured 
                  ? `WhatsApp API Ativo! Enviando mensagens reais para ${contact.phone}.`
                  : "API Oficial não configurada no servidor!"}
              </span>
            </div>
            
            <button 
              onClick={checkConfig} 
              className="p-1 hover:bg-black/5 rounded-full transition-all cursor-pointer text-[10px] font-bold flex items-center space-x-1"
              title="Recarregar status da API"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Verificar</span>
            </button>
          </div>
        )}

        {/* ERROR MESSAGE ALERTS */}
        {apiError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700 font-medium flex items-center space-x-2 shrink-0 animate-in fade-in">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="flex-1"><b>Erro no disparo:</b> {apiError}</span>
            <button onClick={() => setApiError(null)} className="text-red-900 font-bold hover:underline cursor-pointer">OK</button>
          </div>
        )}

        {/* CHAT CONTAINER OR CONFIGURATION STEP-BY-STEP */}
        {apiMode === 'official' && apiConfig && !apiConfig.isConfigured ? (
          
          /* SETUP INSTRUCTIONS FOR OFFICIAL WHATSAPP CLOUD API */
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h4 className="font-bold text-amber-950 text-sm">Disparo de WhatsApp 100% Integrado</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Para que as mensagens reais saiam de forma nativa por dentro deste chat CRM sem abrir abas externas, é obrigatório registrar suas chaves da <b>Meta WhatsApp Cloud API</b> nas variáveis de ambiente.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Settings className="h-3.5 w-3.5 text-slate-500" />
                <span>Como configurar em 3 passos:</span>
              </h5>
              
              <ol className="text-xs text-slate-600 space-y-3.5 pl-4 list-decimal leading-relaxed">
                <li>
                  <p className="font-semibold text-slate-800">Crie um app de Desenvolvedor na Meta:</p>
                  <span className="text-[11px] block mt-0.5 text-slate-500">
                    Acesse o <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" className="text-[#005c4b] font-bold hover:underline">Meta for Developers</a>, crie um app do tipo <b>Business</b> e adicione o produto <b>WhatsApp</b>.
                  </span>
                </li>
                <li>
                  <p className="font-semibold text-slate-800">Adicione as chaves nas Configurações do AI Studio:</p>
                  <p className="text-[11px] mt-1 text-slate-500">
                    No painel de configurações (Settings / Secrets) do seu editor AI Studio, adicione as seguintes variáveis de ambiente:
                  </p>
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[10.5px] mt-1.5 space-y-1.5 border border-slate-800">
                    <div>
                      <span className="text-emerald-400">WHATSAPP_PHONE_NUMBER_ID</span>
                      <span className="text-slate-400">="ID_do_Telefone_da_Meta"</span>
                    </div>
                    <div>
                      <span className="text-emerald-400">WHATSAPP_ACCESS_TOKEN</span>
                      <span className="text-slate-400">="Seu_Token_de_Acesso_Temporario_ou_Permanente"</span>
                    </div>
                    <div>
                      <span className="text-emerald-400">WHATSAPP_WEBHOOK_VERIFY_TOKEN</span>
                      <span className="text-slate-400">="saleshub_token"</span>
                    </div>
                  </div>
                </li>
                <li>
                  <p className="font-semibold text-slate-800">Configure o Webhook na Meta para receber respostas:</p>
                  <p className="text-[11px] mt-1 text-slate-500">
                    No painel do WhatsApp da Meta, vá em Webhooks, clique em Editar. 
                    <b className="text-red-600 block mt-1">⚠️ ATENÇÃO: Use a URL pública do app (Shared App URL) para a Meta conseguir validar o webhook, pois a URL de desenvolvimento requer login privado!</b>
                  </p>
                  <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-lg text-[10.5px] mt-1.5 space-y-2">
                    <div>
                      <span className="font-bold text-slate-600 block">URL de Retorno Recomendada (Pública):</span>
                      <span className="font-mono text-emerald-800 select-all p-1 bg-emerald-50 border border-emerald-200 rounded block mt-0.5 overflow-x-auto whitespace-nowrap font-bold">
                        https://ais-pre-5jftldrnfdtdoa7emravs2-478503100160.us-west2.run.app/api/whatsapp/webhook
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 block">URL de Retorno do Ambiente Atual:</span>
                      <span className="font-mono text-slate-500 select-all p-1 bg-white border border-slate-200 rounded block mt-0.5 overflow-x-auto whitespace-nowrap">
                        {apiConfig.webhookUrl}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-600 block text-[10px]">Token de Verificação:</span>
                        <span className="font-mono text-emerald-700 font-bold">saleshub_token</span>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold font-mono">Assine &apos;messages&apos;</span>
                    </div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-slate-100 p-3.5 rounded-xl text-center">
              <p className="text-xs text-slate-500">
                Enquanto você não configura, use a aba <b>&quot;Simulador&quot;</b> no topo para ver como o chat integrado se comporta com respostas automáticas inteligentes!
              </p>
              <button 
                onClick={() => setApiMode('simulated')}
                className="mt-2.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
              >
                Ativar Simulador de Testes
              </button>
            </div>

          </div>
        ) : (
          
          /* WALLPAPER BACKGROUND WITH CHAT MESSAGES */
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#efeae2] relative"
            style={{
              backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0)',
              backgroundSize: '16px 16px'
            }}
          >
            {filteredMessages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
                >
                  {/* Bubble card */}
                  <div 
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-xs relative ${
                      isMe 
                        ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none border border-emerald-200/50' 
                        : 'bg-white text-[#111b21] rounded-tl-none border border-gray-100'
                    }`}
                  >
                    {/* Text of message */}
                    <p className="leading-relaxed whitespace-pre-line pr-10">{msg.text}</p>
                    
                    {/* Time and receipts */}
                    <div className="absolute bottom-1 right-2 flex items-center space-x-1 text-[9px] text-nature-text-muted">
                      <span>{msg.time}</span>
                      {isMe && (
                        <CheckCheck className="h-3 w-3 text-sky-500 font-bold" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing status */}
            {(isBotTyping || isSendingReal) && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white text-nature-text-muted rounded-xl rounded-tl-none px-4 py-2.5 text-xs shadow-xs border border-gray-100 flex items-center space-x-1 font-mono">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300" />
                  <span className="text-[10px] ml-1.5 text-nature-text-light">
                    {isSendingReal ? 'transmitindo...' : 'digitando...'}
                  </span>
                </div>
              </div>
            )}

            {filteredMessages.length === 0 && (
              <div className="text-center py-12 text-xs text-nature-text-muted font-bold">
                {searchQuery ? 'Nenhuma mensagem encontrada para o filtro.' : 'Conversa em branco. Escreva uma mensagem abaixo!'}
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        )}

        {/* QUICK CRM CHIPS (HORIZONTAL SCROLLABLE TEMPLATES) */}
        {!(apiMode === 'official' && apiConfig && !apiConfig.isConfigured) && (
          <div className="bg-[#f0f2f5] border-t border-nature-border px-3.5 py-2 shrink-0">
            <p className="text-[9px] font-extrabold text-nature-text-muted uppercase tracking-widest font-mono mb-1.5">
              Modelos de Mensagem CRM (Clique para carregar no campo)
            </p>
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {templateChips.map((chip, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(chip.text)}
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-emerald-50 text-nature-text-secondary hover:text-nature-accent border border-nature-border rounded-full text-[10px] font-semibold transition-all shadow-xs cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INPUT SEND AREA */}
        {!(apiMode === 'official' && apiConfig && !apiConfig.isConfigured) && (
          <div className="bg-[#f0f2f5] px-3.5 py-2.5 border-t border-nature-border shrink-0">
            <form onSubmit={handleFormSubmit} className="flex items-center space-x-2.5">
              
              {/* Attachment icons */}
              <div className="flex items-center space-x-2 text-nature-text-muted shrink-0">
                <button type="button" className="p-1 hover:bg-gray-200 rounded-full transition-colors" title="Emojis">
                  <Smile className="h-5 w-5" />
                </button>
                <button type="button" className="p-1 hover:bg-gray-200 rounded-full transition-colors" title="Anexar arquivo">
                  <Paperclip className="h-5 w-5" />
                </button>
              </div>

              {/* Input field */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={apiMode === 'official' ? "Enviar WhatsApp Real..." : "Simulador de teste..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isBotTyping || isSendingReal}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-nature-border rounded-xl text-nature-text-primary focus:outline-none focus:ring-1 focus:ring-nature-accent disabled:opacity-75"
                />
                <span className="absolute right-3.5 top-3 text-[9px] text-nature-text-muted flex items-center space-x-0.5">
                  <CornerDownLeft className="h-3 w-3" />
                  <span>{apiMode === 'official' ? 'Enviar' : 'Simular'}</span>
                </span>
              </div>

              {/* Adaptive Send button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isBotTyping || isSendingReal}
                className={`p-2.5 rounded-full transition-colors cursor-pointer shrink-0 shadow-md flex items-center justify-center ${
                  apiMode === 'official' 
                    ? 'bg-[#25D366] hover:bg-[#20ba5a] text-white' 
                    : 'bg-[#00a884] hover:bg-[#008f6f] text-white'
                }`}
                title={apiMode === 'official' ? "Enviar de verdade para o celular" : "Simular resposta"}
              >
                {apiMode === 'official' ? <WhatsAppIcon className="h-5 w-5" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
          </div>
        )}

        {/* FOOTER CLOSE */}
        <div className="bg-[#f0f2f5] border-t border-nature-border py-2 px-4 flex justify-between items-center text-[10px] text-nature-text-muted font-semibold shrink-0">
          <span className="flex items-center space-x-1">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span>Canal WhatsApp Ativo: <b>{apiMode === 'official' ? 'WhatsApp Cloud API' : 'Simulador Local'}</b></span>
          </span>
          <button 
            onClick={onClose}
            className="text-nature-text-muted hover:text-nature-text-primary uppercase font-black cursor-pointer"
          >
            Fechar Chat
          </button>
        </div>

      </div>
    </div>
  );
}
