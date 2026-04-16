import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchServices, fetchCategories } from '../../store/slices/servicesSlice'

export default function ServiceCatalog() {
  const dispatch = useDispatch()
  const { services, categories, meta, loading } = useSelector((state) => state.services)

  const [filters, setFilters] = useState({
    category_id: '',
    region: '',
    search: '',
    per_page: 12,
  })

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchServices(filters))
  }, [dispatch, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(fetchServices(filters))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catálogo de Serviços</h1>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Categoria</label>
            <select
              className="input"
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
            >
              <option value="">Todas</option>
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
            <label className="label">Região</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: São Paulo"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Buscar</label>
            <input
              type="text"
              className="input"
              placeholder="Buscar serviços..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Carregando serviços...</div>
        </div>
      ) : services.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Nenhum serviço encontrado</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                {service.featured && (
                  <span className="badge badge-warning mb-2">Destaque</span>
                )}
                <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{service.region}</span>
                  <span className="font-medium text-primary-600">
                    R$ {service.price_range}
                  </span>
                </div>
                {service.company?.verified && (
                  <div className="mt-3 flex items-center text-green-600 text-sm">
                    <span className="mr-1">✓</span> Empresa Verificada
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handleFilterChange('page', page)}
                  className={`px-4 py-2 rounded ${
                    meta.current_page === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
