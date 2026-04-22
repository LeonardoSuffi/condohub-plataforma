import { Outlet, Link } from 'react-router-dom'
import { Shield, Star, Clock } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-slate-800 font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-white">
              ServicePro
            </span>
          </Link>

          {/* Main Content */}
          <div className="max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              O marketplace de servicos
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-10">
              Conectamos voce aos melhores profissionais do mercado. Seguro, rapido e gratuito.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">Empresas verificadas</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">Avaliacoes reais de clientes</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">Contrate em minutos</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-slate-400">
            {new Date().getFullYear()} ServicePro. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Service<span className="text-slate-800">Pro</span>
            </span>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <Outlet />
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Ao continuar, voce concorda com nossos{' '}
              <Link to="/terms" className="text-slate-700 hover:underline">Termos</Link>
              {' '}e{' '}
              <Link to="/privacy" className="text-slate-700 hover:underline">Privacidade</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
