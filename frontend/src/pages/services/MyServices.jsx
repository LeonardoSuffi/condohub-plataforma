import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyServices, createService, updateService, deleteService, fetchCategories } from '../../store/slices/servicesSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Upload,
  Star,
  Eye,
  MessageSquare,
  MoreVertical,
  Check,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function MyServices() {
  const dispatch = useDispatch()
  const { myServices, categories, loading } = useSelector((state) => state.services)
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    region: '',
    price_range: '',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    dispatch(fetchMyServices())
    dispatch(fetchCategories())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingService) {
        await dispatch(updateService({ id: editingService.id, data: formData })).unwrap()
        toast.success('Servico atualizado!')
      } else {
        const result = await dispatch(createService(formData)).unwrap()
        toast.success('Servico criado! Adicione imagens para destacar seu servico.')
        setSelectedService(result)
        setShowImageModal(true)
      }
      closeModal()
    } catch (error) {
      toast.error(error || 'Erro ao salvar servico')
    }
  }

  const handleDelete = async () => {
    if (!serviceToDelete) return
    try {
      await dispatch(deleteService(serviceToDelete.id)).unwrap()
      toast.success('Servico excluido!')
      setShowDeleteAlert(false)
      setServiceToDelete(null)
    } catch (error) {
      toast.error(error || 'Erro ao excluir')
    }
  }

  const confirmDelete = (service) => {
    setServiceToDelete(service)
    setShowDeleteAlert(true)
  }

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service)
      setFormData({
        title: service.title,
        description: service.description,
        category_id: String(service.category_id),
        region: service.region,
        price_range: service.price_range,
        tags: service.tags || [],
      })
    } else {
      setEditingService(null)
      setFormData({
        title: '',
        description: '',
        category_id: '',
        region: '',
        price_range: '',
        tags: [],
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingService(null)
  }

  const openImageModal = (service) => {
    setSelectedService(service)
    setShowImageModal(true)
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0 || !selectedService) return

    const formData = new FormData()
    files.forEach(file => {
      formData.append('images[]', file)
    })

    setUploadingImages(true)
    try {
      await api.post(`/services/${selectedService.id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`${files.length} imagem(ns) enviada(s)!`)
      dispatch(fetchMyServices())

      // Refresh selected service
      const updatedServices = await dispatch(fetchMyServices()).unwrap()
      const updated = updatedServices.data.find(s => s.id === selectedService.id)
      if (updated) setSelectedService(updated)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao enviar imagens')
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async (imageId) => {
    if (!selectedService) return
    try {
      await api.delete(`/services/${selectedService.id}/images/${imageId}`)
      toast.success('Imagem removida!')
      dispatch(fetchMyServices())

      // Refresh selected service
      const updatedServices = await dispatch(fetchMyServices()).unwrap()
      const updated = updatedServices.data.find(s => s.id === selectedService.id)
      if (updated) setSelectedService(updated)
    } catch (error) {
      toast.error('Erro ao remover imagem')
    }
  }

  const handleSetCover = async (imageId) => {
    if (!selectedService) return
    try {
      await api.patch(`/services/${selectedService.id}/images/${imageId}/cover`)
      toast.success('Imagem de capa atualizada!')
      dispatch(fetchMyServices())

      // Refresh selected service
      const updatedServices = await dispatch(fetchMyServices()).unwrap()
      const updated = updatedServices.data.find(s => s.id === selectedService.id)
      if (updated) setSelectedService(updated)
    } catch (error) {
      toast.error('Erro ao definir capa')
    }
  }

  const toggleStatus = async (service) => {
    try {
      await dispatch(updateService({
        id: service.id,
        data: { status: service.status === 'ativo' ? 'inativo' : 'ativo' }
      })).unwrap()
      toast.success(`Servico ${service.status === 'ativo' ? 'desativado' : 'ativado'}!`)
    } catch (error) {
      toast.error('Erro ao alterar status')
    }
  }

  const getCoverImage = (service) => {
    if (!service.images || service.images.length === 0) return null
    const cover = service.images.find(img => img.is_cover) || service.images[0]
    return cover?.url ? `${API_BASE}/storage/${cover.path}` : null
  }

  const getImageUrl = (image) => {
    return image?.url || (image?.path ? `${API_BASE}/storage/${image.path}` : null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meus Servicos</h1>
          <p className="text-muted-foreground">
            Gerencie seus servicos e adicione imagens para atrair mais clientes
          </p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Servico
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{myServices.length}</div>
            <div className="text-sm text-muted-foreground">Total de Servicos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {myServices.filter(s => s.status === 'ativo').length}
            </div>
            <div className="text-sm text-muted-foreground">Servicos Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {myServices.reduce((acc, s) => acc + (s.views_count || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Visualizacoes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {myServices.reduce((acc, s) => acc + (s.deals_count || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Negociacoes</div>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : myServices.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum servico cadastrado</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Cadastre seus servicos e adicione fotos para atrair mais clientes.
              Quanto mais completo seu perfil, mais chances de fechar negocios!
            </p>
            <Button onClick={() => openModal()} className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Servico
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myServices.map((service) => {
            const coverImage = getCoverImage(service)
            const imagesCount = service.images?.length || 0

            return (
              <Card key={service.id} className="overflow-hidden group">
                {/* Image/Cover */}
                <div
                  className="relative h-48 bg-gradient-to-br from-muted to-muted/50 cursor-pointer"
                  onClick={() => openImageModal(service)}
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <span className="text-sm">Clique para adicionar fotos</span>
                    </div>
                  )}

                  {/* Overlay with image count */}
                  {imagesCount > 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {imagesCount} {imagesCount === 1 ? 'foto' : 'fotos'}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={service.status === 'ativo' ? 'default' : 'secondary'}>
                      {service.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => { e.stopPropagation(); openImageModal(service) }}
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Fotos
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => { e.stopPropagation(); openModal(service) }}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-1">{service.title}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openModal(service)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openImageModal(service)}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Gerenciar Fotos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(service)}>
                          {service.status === 'ativo' ? (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => confirmDelete(service)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {service.category && (
                      <Badge variant="outline" className="text-xs">
                        {service.category.name}
                      </Badge>
                    )}
                    {service.featured && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Star className="h-3 w-3" />
                        Destaque
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{service.region}</span>
                    <span className="font-medium text-foreground">
                      R$ {service.price_range}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {service.views_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {service.deals_count || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Service Form Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Servico' : 'Novo Servico'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo do Servico</Label>
              <Input
                id="title"
                placeholder="Ex: Manutencao Eletrica Residencial"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                placeholder="Descreva seu servico em detalhes. Quanto mais informacoes, melhor!"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectGroup key={cat.id}>
                      <SelectLabel>{cat.name}</SelectLabel>
                      {cat.children?.map((child) => (
                        <SelectItem key={child.id} value={String(child.id)}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Regiao de Atuacao</Label>
              <Input
                id="region"
                placeholder="Ex: Sao Paulo - SP, Grande ABC"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_range">Faixa de Preco (R$)</Label>
              <Input
                id="price_range"
                placeholder="Ex: 500-1500 ou A partir de 200"
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (pressione Enter para adicionar)</Label>
              <Input
                id="tags"
                placeholder="Ex: eletrica, residencial, urgente"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingService ? 'Salvar Alteracoes' : 'Criar Servico'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Management Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Fotos do Servico: {selectedService?.title}
            </DialogTitle>
          </DialogHeader>

          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              uploadingImages ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImages}
            />
            {uploadingImages ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Enviando imagens...</p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium mb-1">Clique ou arraste imagens aqui</p>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG ou WEBP. Maximo 5MB por imagem. Ate 10 imagens.
                </p>
              </>
            )}
          </div>

          {/* Images Grid */}
          {selectedService?.images && selectedService.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {selectedService.images.map((image) => (
                <div key={image.id} className="relative group rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(image)}
                    alt={image.original_name || 'Imagem do servico'}
                    className="w-full h-32 object-cover"
                  />

                  {/* Cover Badge */}
                  {image.is_cover && (
                    <div className="absolute top-2 left-2">
                      <Badge className="gap-1">
                        <Star className="h-3 w-3" />
                        Capa
                      </Badge>
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.is_cover && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetCover(image.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma imagem adicionada ainda
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Servico</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o servico "{serviceToDelete?.title}"?
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
