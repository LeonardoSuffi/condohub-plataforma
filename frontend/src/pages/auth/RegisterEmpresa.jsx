import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { registerEmpresa, clearError } from '../../store/slices/authSlice'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function RegisterEmpresa() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const password = watch('password')

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onSubmit = async (data) => {
    const result = await dispatch(registerEmpresa(data))
    if (registerEmpresa.fulfilled.match(result)) {
      toast.success('Empresa cadastrada com sucesso!')
      navigate('/dashboard')
    }
  }

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-center mb-6">Cadastrar Empresa</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Nome do Responsável</label>
          <input
            type="text"
            className={`input ${errors.name ? 'input-error' : ''}`}
            {...register('name', { required: 'Nome é obrigatório' })}
          />
          {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
        </div>

        <div>
          <label className="label">E-mail</label>
          <input
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            {...register('email', {
              required: 'E-mail é obrigatório',
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'E-mail inválido' }
            })}
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
        </div>

        <div>
          <label className="label">CNPJ</label>
          <input
            type="text"
            className={`input ${errors.cnpj ? 'input-error' : ''}`}
            placeholder="00.000.000/0000-00"
            {...register('cnpj', {
              required: 'CNPJ é obrigatório',
              minLength: { value: 18, message: 'CNPJ incompleto' }
            })}
            onChange={(e) => {
              e.target.value = formatCNPJ(e.target.value)
            }}
          />
          {errors.cnpj && <span className="text-red-500 text-sm">{errors.cnpj.message}</span>}
        </div>

        <div>
          <label className="label">Razão Social</label>
          <input
            type="text"
            className={`input ${errors.razao_social ? 'input-error' : ''}`}
            {...register('razao_social', { required: 'Razão social é obrigatória' })}
          />
          {errors.razao_social && <span className="text-red-500 text-sm">{errors.razao_social.message}</span>}
        </div>

        <div>
          <label className="label">Nome Fantasia (opcional)</label>
          <input
            type="text"
            className="input"
            {...register('nome_fantasia')}
          />
        </div>

        <div>
          <label className="label">Segmento</label>
          <select className={`input ${errors.segmento ? 'input-error' : ''}`} {...register('segmento', { required: 'Segmento é obrigatório' })}>
            <option value="">Selecione...</option>
            <option value="Manutenção Predial">Manutenção Predial</option>
            <option value="Limpeza">Limpeza</option>
            <option value="Segurança">Segurança</option>
            <option value="Jardinagem">Jardinagem</option>
            <option value="Elevadores">Elevadores</option>
            <option value="Administração">Administração</option>
            <option value="Outros">Outros</option>
          </select>
          {errors.segmento && <span className="text-red-500 text-sm">{errors.segmento.message}</span>}
        </div>

        <div>
          <label className="label">Telefone (opcional)</label>
          <input
            type="text"
            className="input"
            placeholder="(00) 00000-0000"
            {...register('telefone')}
          />
        </div>

        <div>
          <label className="label">Senha</label>
          <input
            type="password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' }
            })}
          />
          {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
        </div>

        <div>
          <label className="label">Confirmar Senha</label>
          <input
            type="password"
            className={`input ${errors.password_confirmation ? 'input-error' : ''}`}
            {...register('password_confirmation', {
              required: 'Confirme a senha',
              validate: value => value === password || 'Senhas não conferem'
            })}
          />
          {errors.password_confirmation && <span className="text-red-500 text-sm">{errors.password_confirmation.message}</span>}
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary">
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Já tem conta? <Link to="/login" className="text-primary-600 hover:underline">Entrar</Link>
      </p>
    </div>
  )
}
