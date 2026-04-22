import { useState } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AddressAutocomplete({ onAddressSelect, className }) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCepSearch = async () => {
    if (cep.length !== 8) {
      setError('CEP deve ter 8 digitos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (data.erro) {
        setError('CEP nao encontrado')
        return
      }

      onAddressSelect?.({
        cep: data.cep?.replace('-', ''),
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      })
    } catch (_err) {
      setError('Erro ao buscar CEP')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCepSearch()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-gray-700">
        Buscar por CEP
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={cep}
            onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
            onKeyDown={handleKeyDown}
            placeholder="Digite o CEP"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
        </div>
        <button
          type="button"
          onClick={handleCepSearch}
          disabled={loading || cep.length !== 8}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Buscar
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default AddressAutocomplete
