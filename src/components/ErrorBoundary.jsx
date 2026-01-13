import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-popover p-4 rounded">
            <div className="font-bold text-foreground">Rendering error</div>
            <div className="text-xs mt-2 text-muted-foreground">{String(this.state.error)}</div>
            <div className="mt-3 text-sm text-muted-foreground">
              Try removing the selected model or check the console for loader errors.
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
