import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { registerCliente, clearError } from '../../store/slices/authSlice'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function RegisterCliente() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const password = watch('password')
  const tipo = watch('tipo')

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onSubmit = async (data) => {
    const result = await dispatch(registerCliente(data))
    if (registerCliente.fulfilled.match(result)) {
      toast.success('Cadastro realizado com sucesso!')
      navigate('/dashboard')
    }
  }

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14)
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
      <h2 className="text-2xl font-bold text-center mb-6">Cadastrar Cliente</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Nome Completo</label>
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
          <label className="label">Tipo de Cliente</label>
          <select className={`input ${errors.tipo ? 'input-error' : ''}`} {...register('tipo', { required: 'Selecione o tipo' })}>
            <option value="">Selecione...</option>
            <option value="sindico">Síndico</option>
            <option value="administradora">Administradora</option>
            <option value="condominio">Condomínio</option>
          </select>
          {errors.tipo && <span className="text-red-500 text-sm">{errors.tipo.message}</span>}
        </div>

        {tipo === 'sindico' && (
          <div>
            <label className="label">CPF</label>
            <input
              type="text"
              className={`input ${errors.cpf ? 'input-error' : ''}`}
              placeholder="000.000.000-00"
              {...register('cpf', { required: tipo === 'sindico' ? 'CPF é obrigatório para síndicos' : false })}
              onChange={(e) => { e.target.value = formatCPF(e.target.value) }}
            />
            {errors.cpf && <span className="text-red-500 text-sm">{errors.cpf.message}</span>}
          </div>
        )}

        {tipo === 'administradora' && (
          <div>
            <label className="label">CNPJ</label>
            <input
              type="text"
              className={`input ${errors.cnpj ? 'input-error' : ''}`}
              placeholder="00.000.000/0000-00"
              {...register('cnpj', { required: tipo === 'administradora' ? 'CNPJ é obrigatório para administradoras' : false })}
              onChange={(e) => { e.target.value = formatCNPJ(e.target.value) }}
            />
            {errors.cnpj && <span className="text-red-500 text-sm">{errors.cnpj.message}</span>}
          </div>
        )}

        <div>
          <label className="label">Nome do Condomínio (opcional)</label>
          <input
            type="text"
            className="input"
            {...register('nome_condominio')}
          />
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
