import { Outlet, Link } from 'react-router-dom'
import { Shield, BarChart3, FileText, Sparkles } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 flex">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-primary-950/50 to-neutral-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-violet/10 rounded-full blur-[128px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative flex flex-col justify-between w-full p-10 xl:p-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow transition-all duration-300 group-hover:shadow-glow-lg group-hover:scale-105">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-white">
              Condo<span className="text-primary-400">Hub</span>
            </span>
          </Link>

          {/* Main content */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              <span className="text-xs text-primary-400 font-medium">Plataforma Completa</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Seu marketplace
              <span className="block gradient-text">condominial</span>
            </h1>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Conectamos clientes aos melhores prestadores de servicos. Negocie com seguranca e transparencia.
            </p>

            {/* Features */}
            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/10 group-hover:border-primary-500/30 transition-all duration-300">
                  <Shield className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Negociacoes seguras</h3>
                  <p className="text-neutral-500 text-sm mt-1">Seus dados permanecem anonimos ate o fechamento</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-cyan/10 group-hover:border-accent-cyan/30 transition-all duration-300">
                  <BarChart3 className="w-5 h-5 text-accent-cyan" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Ranking de empresas</h3>
                  <p className="text-neutral-500 text-sm mt-1">Escolha baseado em avaliacoes reais</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-violet/10 group-hover:border-accent-violet/30 transition-all duration-300">
                  <FileText className="w-5 h-5 text-accent-violet" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Gestao completa</h3>
                  <p className="text-neutral-500 text-sm mt-1">Ordens, contratos e pagamentos centralizados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-neutral-600">
            {new Date().getFullYear()} CondoHub. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative">
        {/* Subtle background effect for form side */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-950/20 via-transparent to-transparent" />

        <div className="relative w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-white">
              Condo<span className="text-primary-400">Hub</span>
            </span>
          </div>

          {/* Form content */}
          <div className="glass rounded-2xl border border-white/10 p-8">
            <Outlet />
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Ao continuar, voce concorda com nossos{' '}
              <Link to="/terms" className="text-neutral-400 hover:text-primary-400 transition-colors">Termos</Link>
              {' '}e{' '}
              <Link to="/privacy" className="text-neutral-400 hover:text-primary-400 transition-colors">Privacidade</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
