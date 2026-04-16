import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCurrentUser, updateProfile, clearError } from '../store/slices/authSlice'
import PlanSelectionModal from '../components/PlanSelectionModal'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [stats, setStats] = useState(null)
  const [recentDeals, setRecentDeals] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const photoInputRef = useRef(null)
  const logoInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nome_fantasia: '',
    segmento: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    descricao: '',
    nome_condominio: '',
    endereco_condominio: '',
    num_unidades: '',
  })

  useEffect(() => {
    loadProfileData()
  }, [])

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || '',
        email: user.email || '',
      }

      if (user.type === 'empresa' && user.company_profile) {
        data.nome_fantasia = user.company_profile.nome_fantasia || ''
        data.segmento = user.company_profile.segmento || ''
        data.telefone = user.company_profile.telefone || ''
        data.endereco = user.company_profile.endereco || ''
        data.cidade = user.company_profile.cidade || ''
        data.estado = user.company_profile.estado || ''
        data.cep = user.company_profile.cep || ''
        data.descricao = user.company_profile.descricao || ''
      } else if (user.type === 'cliente' && user.client_profile) {
        data.telefone = user.client_profile.telefone || ''
        data.nome_condominio = user.client_profile.nome_condominio || ''
        data.endereco_condominio = user.client_profile.endereco_condominio || ''
        data.cidade = user.client_profile.cidade || ''
        data.estado = user.client_profile.estado || ''
        data.cep = user.client_profile.cep || ''
        data.num_unidades = user.client_profile.num_unidades || ''
      }

      setFormData(data)
    }
  }, [user])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const loadProfileData = async () => {
    setLoadingStats(true)
    try {
      const [dealsRes, ordersRes] = await Promise.all([
        api.get('/deals', { params: { per_page: 100 } }),
        api.get('/orders', { params: { per_page: 100 } }),
      ])

      const deals = dealsRes.data?.data || []
      const orders = ordersRes.data?.data || []

      // Calculate stats
      const totalDeals = deals.length
      const dealsAbertos = deals.filter(d => d.status === 'aberto').length
      const dealsNegociando = deals.filter(d => d.status === 'negociando').length
      const dealsAceitos = deals.filter(d => d.status === 'aceito' || d.status === 'concluido').length
      const dealsRejeitados = deals.filter(d => d.status === 'rejeitado').length

      const totalOrders = orders.length
      const ordersValue = orders.reduce((sum, o) => sum + parseFloat(o.value || 0), 0)
      const ordersConcluidas = orders.filter(o => o.status === 'concluido').length

      setStats({
        totalDeals,
        dealsAbertos,
        dealsNegociando,
        dealsAceitos,
        dealsRejeitados,
        totalOrders,
        ordersValue,
        ordersConcluidas,
        taxaConversao: totalDeals > 0 ? Math.round((dealsAceitos / totalDeals) * 100) : 0,
      })

      setRecentDeals(deals.slice(0, 5))
    } catch (error) {
      console.error('Erro ao carregar estatisticas:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(updateProfile(formData))
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
      dispatch(fetchCurrentUser())
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no maximo 2MB')
      return
    }

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('foto', file)

    try {
      await api.post('/users/me/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Foto atualizada!')
      dispatch(fetchCurrentUser())
    } catch (error) {
      toast.error('Erro ao enviar foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no maximo 2MB')
      return
    }

    setUploadingLogo(true)
    const formDataObj = new FormData()
    formDataObj.append('logo', file)

    try {
      await api.post('/users/me/logo', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Logo atualizada!')
      dispatch(fetchCurrentUser())
    } catch (error) {
      toast.error('Erro ao enviar logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!confirm('Remover foto de perfil?')) return

    try {
      await api.delete('/users/me/foto')
      toast.success('Foto removida!')
      dispatch(fetchCurrentUser())
    } catch (error) {
      toast.error('Erro ao remover foto')
    }
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Remover logo da empresa?')) return

    try {
      await api.delete('/users/me/logo')
      toast.success('Logo removida!')
      dispatch(fetchCurrentUser())
    } catch (error) {
      toast.error('Erro ao remover logo')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      aberto: 'bg-blue-100 text-blue-700',
      negociando: 'bg-yellow-100 text-yellow-700',
      aceito: 'bg-green-100 text-green-700',
      concluido: 'bg-green-100 text-green-700',
      rejeitado: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      aberto: 'Aberto',
      negociando: 'Negociando',
      aceito: 'Aceito',
      concluido: 'Concluido',
      rejeitado: 'Rejeitado',
    }
    return labels[status] || status
  }

  const completion = user?.profile_completion || { percentage: 0, completed: 0, total: 0 }
  const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas informacoes e acompanhe suas estatisticas</p>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {completion.percentage < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                Seu perfil esta {completion.percentage}% completo
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Complete seu perfil para aumentar suas chances de fechar negocios
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-amber-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${completion.percentage}%` }} />
              </div>
              <span className="text-sm font-medium text-amber-700">{completion.percentage}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Photo */}
                <div className="relative group">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                    {user?.foto_path ? (
                      <img src={`${storageUrl}/${user.foto_path}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-2xl font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    {uploadingPhoto ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                    )}
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">{user?.name}</h2>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {user?.type === 'empresa' ? 'Prestador' : user?.type === 'cliente' ? 'Sindico' : 'Admin'}
                    </span>
                    {user?.type === 'empresa' && user?.company_profile?.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verificado
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditing(false)} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
                        Cancelar
                      </button>
                      <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50">
                        {loading ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logo for Companies */}
            {user?.type === 'empresa' && (
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                      {user?.company_profile?.logo_path ? (
                        <img src={`${storageUrl}/${user.company_profile.logo_path}`} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                        </svg>
                      )}
                    </div>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-700"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Logo da empresa</p>
                    <p className="text-xs text-gray-500">PNG ou JPG, max 2MB</p>
                  </div>
                  {user?.company_profile?.logo_path && (
                    <button onClick={handleRemoveLogo} className="text-xs text-red-600 hover:text-red-700">Remover</button>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="(00) 00000-0000"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                  />
                </div>

                {user?.type === 'empresa' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                      <input
                        type="text"
                        name="nome_fantasia"
                        value={formData.nome_fantasia}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
                      <input
                        type="text"
                        name="segmento"
                        value={formData.segmento}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Ex: Manutencao, Limpeza..."
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="00000-000"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereco</label>
                      <input
                        type="text"
                        name="endereco"
                        value={formData.endereco}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      >
                        <option value="">Selecione</option>
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                      <textarea
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Descreva sua empresa e servicos..."
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>
                  </>
                )}

                {user?.type === 'cliente' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Condominio</label>
                      <input
                        type="text"
                        name="nome_condominio"
                        value={formData.nome_condominio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Unidades</label>
                      <input
                        type="number"
                        name="num_unidades"
                        value={formData.num_unidades}
                        onChange={handleChange}
                        disabled={!isEditing}
                        min={1}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereco do Condominio</label>
                      <input
                        type="text"
                        name="endereco_condominio"
                        value={formData.endereco_condominio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="00000-000"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      >
                        <option value="">Selecione</option>
                        {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Negociacoes Recentes</h3>
                <Link to="/deals" className="text-sm text-gray-600 hover:text-gray-900">Ver todas</Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {loadingStats ? (
                <div className="p-6 text-center text-gray-500 text-sm">Carregando...</div>
              ) : recentDeals.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">Nenhuma negociacao encontrada</div>
              ) : (
                recentDeals.map((deal) => (
                  <Link key={deal.id} to={`/chat/${deal.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                      {(deal.service?.title || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{deal.service?.title || 'Servico'}</p>
                      <p className="text-xs text-gray-500">{formatDate(deal.created_at)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(deal.status)}`}>
                      {getStatusLabel(deal.status)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Plan */}
        <div className="space-y-6">
          {/* Plan Card - Only for Empresas */}
          {user?.type === 'empresa' && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Plano Atual</h3>
              </div>
              <div className="p-5">
                {user.active_subscription ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-gray-900">{user.active_subscription.plan?.name}</span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Ativo</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Valor</span>
                        <span className="text-gray-900 font-medium">
                          {formatCurrency(user.active_subscription.plan?.price || 0)}/mes
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Valido ate</span>
                        <span className="text-gray-900">{formatDate(user.active_subscription.ends_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Servicos</span>
                        <span className="text-gray-900">{user.active_subscription.plan?.max_services || 'Ilimitado'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPlanModal(true)}
                      className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Alterar plano
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Sem plano ativo</p>
                    <p className="text-xs text-gray-500 mb-3">Assine para publicar servicos</p>
                    <button
                      onClick={() => setShowPlanModal(true)}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                    >
                      Ver planos
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Estatisticas</h3>
            </div>
            <div className="p-5">
              {loadingStats ? (
                <div className="text-center text-gray-500 text-sm py-4">Carregando...</div>
              ) : (
                <div className="space-y-4">
                  {/* Total Negotiations */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">Total Negociacoes</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{stats?.totalDeals || 0}</span>
                  </div>

                  {/* Conversion Rate */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">Taxa Conversao</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{stats?.taxaConversao || 0}%</span>
                  </div>

                  {/* Deals Accepted */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">Aceitos</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{stats?.dealsAceitos || 0}</span>
                  </div>

                  {/* In Negotiation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">Em negociacao</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{stats?.dealsNegociando || 0}</span>
                  </div>

                  {/* Total Orders Value */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">Valor em ordens</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(stats?.ordersValue || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Conta</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Membro desde</span>
                <span className="text-gray-900">{user?.created_at ? formatDate(user.created_at) : '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Perfil</span>
                <span className="text-gray-900">{completion.percentage}% completo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium">Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      <PlanSelectionModal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} />
    </div>
  )
}
