"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Package, Users, FileText, LayoutDashboard, Trash2, Edit, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Badge } from "@/components/ui/badge"

type ItemCategory = "produto" | "cliente" | "documento"

interface Item {
  id: string
  name: string
  description: string
  category: ItemCategory
  createdAt: string
  status: "ativo" | "inativo"
}

const categoryConfig = {
  produto: { label: "Produto", icon: Package, color: "bg-blue-500/20 text-blue-400" },
  cliente: { label: "Cliente", icon: Users, color: "bg-green-500/20 text-green-400" },
  documento: { label: "Documento", icon: FileText, color: "bg-yellow-500/20 text-yellow-400" },
}

export default function SistemaGestaoPage() {
  const [items, setItems, isLoaded] = useLocalStorage<Item[]>("gestao-items", [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<ItemCategory | "all">("all")
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "produto" as ItemCategory,
    status: "ativo" as "ativo" | "inativo",
  })

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: items.length,
    produtos: items.filter((i) => i.category === "produto").length,
    clientes: items.filter((i) => i.category === "cliente").length,
    documentos: items.filter((i) => i.category === "documento").length,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingItem) {
      setItems(items.map((item) =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      ))
    } else {
      const newItem: Item = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date().toISOString(),
      }
      setItems([...items, newItem])
    }
    
    resetForm()
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      status: item.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "produto",
      status: "ativo",
    })
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Voltar ao Portfólio</span>
              </Link>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Sistema de Gestão</h1>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Editar Item" : "Cadastrar Novo Item"}</DialogTitle>
                  <DialogDescription>
                    {editingItem 
                      ? "Edite as informações do item abaixo."
                      : "Preencha as informações para cadastrar um novo item."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Nome
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Digite o nome..."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-foreground">
                      Descricao
                    </label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Digite a descricao..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium text-foreground">
                      Categoria
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="produto">Produto</option>
                      <option value="cliente">Cliente</option>
                      <option value="documento">Documento</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium text-foreground">
                      Status
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "ativo" | "inativo" })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingItem ? "Salvar Alteracoes" : "Cadastrar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de Itens</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.produtos}</p>
                <p className="text-xs text-muted-foreground">Produtos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.clientes}</p>
                <p className="text-xs text-muted-foreground">Clientes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <FileText className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.documentos}</p>
                <p className="text-xs text-muted-foreground">Documentos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory("all")}
              >
                Todos
              </Button>
              <Button
                variant={filterCategory === "produto" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory("produto")}
              >
                <Package className="h-4 w-4 mr-1" />
                Produtos
              </Button>
              <Button
                variant={filterCategory === "cliente" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory("cliente")}
              >
                <Users className="h-4 w-4 mr-1" />
                Clientes
              </Button>
              <Button
                variant={filterCategory === "documento" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory("documento")}
              >
                <FileText className="h-4 w-4 mr-1" />
                Documentos
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || filterCategory !== "all" 
                  ? "Nenhum item encontrado"
                  : "Nenhum item cadastrado"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || filterCategory !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Clique no botao acima para cadastrar seu primeiro item."}
              </p>
              {!searchTerm && filterCategory === "all" && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Item
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Data</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const CategoryIcon = categoryConfig[item.category].icon
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description || "Sem descricao"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className={categoryConfig[item.category].color}>
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {categoryConfig[item.category].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={item.status === "ativo" ? "default" : "secondary"}>
                          {item.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir &quot;{item.name}&quot;? Esta acao nao pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Os dados sao salvos localmente no seu navegador usando LocalStorage.
          </p>
        </div>
      </main>
    </div>
  )
}
