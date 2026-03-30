"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Search,
  Trash2,
  User,
  Headphones,
  XCircle,
} from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "cliente" | "atendente"
  timestamp: string
}

interface TicketItem {
  id: string
  title: string
  description: string
  category: string
  priority: "baixa" | "media" | "alta" | "urgente"
  status: "aberto" | "em_andamento" | "aguardando" | "resolvido" | "fechado"
  customerName: string
  customerEmail: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

const defaultTickets: TicketItem[] = [
  {
    id: "1",
    title: "Problema com login",
    description: "Não consigo acessar minha conta após trocar de senha",
    category: "Suporte Técnico",
    priority: "alta",
    status: "aberto",
    customerName: "João Silva",
    customerEmail: "joao@email.com",
    messages: [
      {
        id: "m1",
        content: "Olá, estou com problema para fazer login após trocar minha senha ontem.",
        sender: "cliente",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    title: "Dúvida sobre faturamento",
    description: "Preciso de segunda via da nota fiscal",
    category: "Financeiro",
    priority: "media",
    status: "em_andamento",
    customerName: "Maria Santos",
    customerEmail: "maria@email.com",
    messages: [
      {
        id: "m2",
        content: "Preciso da segunda via da nota fiscal do mês passado.",
        sender: "cliente",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "m3",
        content: "Olá Maria! Claro, vou gerar a segunda via para você. Pode me informar o número do pedido?",
        sender: "atendente",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

const categories = ["Suporte Técnico", "Financeiro", "Comercial", "Dúvidas Gerais", "Reclamação"]

export default function PortalAtendimentoPage() {
  const [tickets, setTickets, isLoaded] = useLocalStorage<TicketItem[]>("portal-tickets", defaultTickets)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null)
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [senderMode, setSenderMode] = useState<"cliente" | "atendente">("atendente")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: categories[0],
    priority: "media" as TicketItem["priority"],
    customerName: "",
    customerEmail: "",
  })

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedTicket?.messages])

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      abertos: tickets.filter((t) => t.status === "aberto").length,
      emAndamento: tickets.filter((t) => t.status === "em_andamento").length,
      resolvidos: tickets.filter((t) => t.status === "resolvido" || t.status === "fechado").length,
    }
  }, [tickets])

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.includes(searchTerm)
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tickets, searchTerm, statusFilter, priorityFilter])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: categories[0],
      priority: "media",
      customerName: "",
      customerEmail: "",
    })
  }

  const handleCreateTicket = () => {
    if (!formData.title || !formData.customerName || !formData.customerEmail) return

    const newTicket: TicketItem = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: "aberto",
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      messages: formData.description
        ? [
            {
              id: `m-${Date.now()}`,
              content: formData.description,
              sender: "cliente",
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTickets([newTicket, ...tickets])
    setIsNewTicketOpen(false)
    resetForm()
  }

  const handleDeleteTicket = () => {
    if (deleteTicketId) {
      setTickets(tickets.filter((t) => t.id !== deleteTicketId))
      if (selectedTicket?.id === deleteTicketId) {
        setSelectedTicket(null)
      }
      setDeleteTicketId(null)
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return

    const message: Message = {
      id: `m-${Date.now()}`,
      content: newMessage,
      sender: senderMode,
      timestamp: new Date().toISOString(),
    }

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      updatedAt: new Date().toISOString(),
      status: senderMode === "atendente" && selectedTicket.status === "aberto" 
        ? "em_andamento" as const
        : selectedTicket.status,
    }

    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)))
    setSelectedTicket(updatedTicket)
    setNewMessage("")
  }

  const updateTicketStatus = (ticketId: string, status: TicketItem["status"]) => {
    const updatedTickets = tickets.map((t) =>
      t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t
    )
    setTickets(updatedTickets)
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status })
    }
  }

  const getPriorityColor = (priority: TicketItem["priority"]) => {
    switch (priority) {
      case "urgente":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "alta":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "media":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "baixa":
        return "bg-green-500/10 text-green-500 border-green-500/20"
    }
  }

  const getStatusIcon = (status: TicketItem["status"]) => {
    switch (status) {
      case "aberto":
        return <AlertCircle className="h-4 w-4" />
      case "em_andamento":
        return <Clock className="h-4 w-4" />
      case "aguardando":
        return <Clock className="h-4 w-4" />
      case "resolvido":
        return <CheckCircle className="h-4 w-4" />
      case "fechado":
        return <XCircle className="h-4 w-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/#projects">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Portal de Atendimento</h1>
                <p className="text-xs text-muted-foreground">Sistema de Tickets</p>
              </div>
            </div>
            
            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Novo Ticket</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Abrir Novo Ticket</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para abrir um chamado
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Nome</FieldLabel>
                      <Input
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Seu nome"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>E-mail</FieldLabel>
                      <Input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="seu@email.com"
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Assunto</FieldLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Resumo do problema"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Categoria</FieldLabel>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </Field>
                    <Field>
                      <FieldLabel>Prioridade</FieldLabel>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketItem["priority"] })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel>Descrição</FieldLabel>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva seu problema em detalhes"
                      rows={4}
                    />
                  </Field>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTicket}>Abrir Ticket</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{stats.abertos}</p>
              <p className="text-xs text-muted-foreground">Abertos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.emAndamento}</p>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.resolvidos}</p>
              <p className="text-xs text-muted-foreground">Resolvidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tickets List */}
        <div className={`${selectedTicket ? "hidden md:flex" : "flex"} flex-col w-full md:w-96 border-r border-border bg-card`}>
          {/* Filters */}
          <div className="p-4 space-y-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-input text-foreground"
              >
                <option value="all">Todos Status</option>
                <option value="aberto">Aberto</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="aguardando">Aguardando</option>
                <option value="resolvido">Resolvido</option>
                <option value="fechado">Fechado</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-input text-foreground"
              >
                <option value="all">Prioridade</option>
                <option value="urgente">Urgente</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>

          {/* Tickets */}
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum ticket encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                      selectedTicket?.id === ticket.id ? "bg-secondary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{ticket.id}
                      </span>
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground line-clamp-1 mb-1">
                      {ticket.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {ticket.customerName}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getStatusIcon(ticket.status)}
                        <span className="capitalize">{ticket.status.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {ticket.messages.length}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail / Chat */}
        {selectedTicket ? (
          <div className="flex-1 flex flex-col bg-background">
            {/* Ticket Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedTicket(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">
                        #{selectedTicket.id}
                      </span>
                      <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                    <h2 className="font-semibold text-foreground">{selectedTicket.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.customerName} • {selectedTicket.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as TicketItem["status"])}
                    className="px-3 py-1.5 text-sm rounded-lg border border-border bg-input text-foreground"
                  >
                    <option value="aberto">Aberto</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="aguardando">Aguardando</option>
                    <option value="resolvido">Resolvido</option>
                    <option value="fechado">Fechado</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTicketId(selectedTicket.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "atendente" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === "atendente"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === "atendente" ? (
                        <Headphones className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      <span className="text-xs opacity-80">
                        {message.sender === "atendente" ? "Atendente" : selectedTicket.customerName}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">Responder como:</span>
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setSenderMode("atendente")}
                    className={`px-3 py-1 text-sm transition-colors ${
                      senderMode === "atendente"
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Headphones className="h-4 w-4 inline mr-1" />
                    Atendente
                  </button>
                  <button
                    onClick={() => setSenderMode("cliente")}
                    className={`px-3 py-1 text-sm transition-colors ${
                      senderMode === "cliente"
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-1" />
                    Cliente
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-background">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Selecione um ticket para ver os detalhes</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTicketId} onOpenChange={() => setDeleteTicketId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTicket}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
