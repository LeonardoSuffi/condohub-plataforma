import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyServices, createService, updateService, deleteService, fetchCategories } from '../../store/slices/servicesSlice'
import toast from 'react-hot-toast'

export default function MyServices() {
  const dispatch = useDispatch()
  const { myServices, categories, loading } = useSelector((state) => state.services)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    region: '',
    price_range: '',
  })

  useEffect(() => {
    dispatch(fetchMyServices())
    dispatch(fetchCategories())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingService) {
        await dispatch(updateService({ id: editingService.id, data: formData })).unwrap()
        toast.success('Serviço atualizado!')
      } else {
        await dispatch(createService(formData)).unwrap()
        toast.success('Serviço criado!')
      }
      closeModal()
    } catch (error) {
      toast.error(error || 'Erro ao salvar serviço')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await dispatch(deleteService(id)).unwrap()
        toast.success('Serviço excluído!')
      } catch (error) {
        toast.error(error || 'Erro ao excluir')
      }
    }
  }

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service)
      setFormData({
        title: service.title,
        description: service.description,
        category_id: service.category_id,
        region: service.region,
        price_range: service.price_range,
      })
    } else {
      setEditingService(null)
      setFormData({
        title: '',
        description: '',
        category_id: '',
        region: '',
        price_range: '',
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingService(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meus Serviços</h1>
        <button onClick={() => openModal()} className="btn-primary">
          + Novo Serviço
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : myServices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Você ainda não cadastrou nenhum serviço</p>
          <button onClick={() => openModal()} className="btn-primary">
            Cadastrar Primeiro Serviço
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {myServices.map((service) => (
            <div key={service.id} className="card flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{service.title}</h3>
                  <span className={`badge ${service.status === 'ativo' ? 'badge-success' : 'badge-danger'}`}>
                    {service.status}
                  </span>
                  {service.featured && <span className="badge badge-warning">Destaque</span>}
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{service.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{service.category?.name}</span>
                  <span>{service.region}</span>
                  <span>R$ {service.price_range}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openModal(service)}
                  className="btn-secondary text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="btn-danger text-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Título</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea
                  className="input"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Categoria</label>
                <select
                  className="input"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {categories.map((cat) => (
                    <optgroup key={cat.id} label={cat.name}>
                      {cat.children?.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Região de Atuação</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: São Paulo - SP"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Faixa de Preço</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: 500-1000"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
