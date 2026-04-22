import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Algo deu errado
            </h1>
            <div className="bg-red-100 rounded p-4 mb-4">
              <p className="text-red-800 font-mono text-sm">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>
            <details className="bg-gray-100 rounded p-4">
              <summary className="cursor-pointer font-medium text-gray-700">
                Detalhes do erro
              </summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Recarregar pagina
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
