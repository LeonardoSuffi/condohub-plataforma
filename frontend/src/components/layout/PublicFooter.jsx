import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Globe, ExternalLink, Share2 } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-white">
                Condo<span className="text-primary-400">Hub</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              O marketplace que conecta voce as melhores empresas de servicos.
              Encontre profissionais qualificados para qualquer necessidade.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="#" className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300">
                <ExternalLink className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/empresas" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                  Buscar Empresas
                </Link>
              </li>
              <li>
                <Link to="/#como-funciona" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Para Empresas
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/register/empresa" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                  Cadastre sua Empresa
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                  Area do Parceiro
                </Link>
              </li>
              <li>
                <Link to="/#vantagens" className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                  Vantagens
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Contato
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">contato@condohub.com.br</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">(11) 99999-9999</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Sao Paulo, SP</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} CondoHub. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Privacidade
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
