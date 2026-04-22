import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-white">
                ServicePro
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              A plataforma que conecta voce aos melhores prestadores de servicos do mercado.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                <span className="text-sm font-bold">in</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                <span className="text-sm font-bold">fb</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                <span className="text-sm font-bold">ig</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white mb-4">Plataforma</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/empresas" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Encontrar Empresas
                </Link>
              </li>
              <li>
                <Link to="/register/empresa" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cadastrar Empresa
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                contato@servicepro.com.br
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                Sao Paulo, SP
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} ServicePro. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">
                Privacidade
              </span>
              <span className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">
                Termos de Uso
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
