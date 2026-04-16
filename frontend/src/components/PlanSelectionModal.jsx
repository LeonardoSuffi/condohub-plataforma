import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPlans, subscribeToPlan, changePlan, clearError } from '../store/slices/subscriptionSlice'
import { fetchCurrentUser } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function PlanSelectionModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { plans, loading, error, activeSubscription } = useSelector((state) => state.subscription)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPlans())
    }
  }, [isOpen, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleSelectPlan = async (plan) => {
    let result

    if (activeSubscription) {
      result = await dispatch(changePlan({ subscriptionId: activeSubscription.id, planId: plan.id }))
      if (changePlan.fulfilled.match(result)) {
        toast.success('Plano alterado com sucesso!')
        dispatch(fetchCurrentUser())
        onClose()
      }
    } else {
      result = await dispatch(subscribeToPlan(plan.id))
      if (subscribeToPlan.fulfilled.match(result)) {
        toast.success('Plano ativado com sucesso!')
        dispatch(fetchCurrentUser())
        onClose()
      }
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const parseFeatures = (features) => {
    if (!features) return []
    if (Array.isArray(features)) return features
    try {
      return JSON.parse(features)
    } catch {
      return []
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Escolha seu Plano</h2>
              <p className="text-gray-500 text-sm mt-1">
                Selecione o plano ideal para sua empresa
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => {
                const features = parseFeatures(plan.features)
                const isCurrentPlan = activeSubscription?.plan_id === plan.id
                const isPopular = index === 1 // Middle plan is popular

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border-2 p-6 transition-all ${
                      isPopular
                        ? 'border-gray-900 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isCurrentPlan ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    {/* Popular badge */}
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                          Mais popular
                        </span>
                      </div>
                    )}

                    {/* Current plan badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                          Plano atual
                        </span>
                      </div>
                    )}

                    {/* Plan name */}
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">{plan.name}</h3>

                    {/* Price */}
                    <div className="mt-4 mb-6">
                      <span className="text-3xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                      <span className="text-gray-500 text-sm">/mes</span>
                    </div>

                    {/* Description */}
                    {plan.description && (
                      <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                    )}

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {/* Deals limit */}
                      <li className="flex items-center gap-3 text-sm">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">
                          {plan.deals_limit === -1 ? 'Negociacoes ilimitadas' : `${plan.deals_limit} negociacoes/mes`}
                        </span>
                      </li>

                      {/* Custom features */}
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={loading || isCurrentPlan}
                      className={`w-full py-3 font-medium rounded-lg transition-colors ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isPopular
                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isCurrentPlan
                        ? 'Plano atual'
                        : activeSubscription
                          ? 'Mudar para este plano'
                          : 'Selecionar plano'
                      }
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* FAQ */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-4">Perguntas Frequentes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Posso trocar de plano depois?</p>
                <p className="text-gray-500 mt-1">Sim, voce pode fazer upgrade ou downgrade a qualquer momento.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Como funciona o pagamento?</p>
                <p className="text-gray-500 mt-1">O pagamento e mensal e renovado automaticamente.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Posso cancelar quando quiser?</p>
                <p className="text-gray-500 mt-1">Sim, nao ha fidelidade. Cancele quando precisar.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">O que acontece se eu exceder o limite?</p>
                <p className="text-gray-500 mt-1">Voce sera notificado e podera fazer upgrade do plano.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
