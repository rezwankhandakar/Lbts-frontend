import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * Rendered in place of the subtree. `reset` clears the error and re-attempts
   * the render, which is worth offering because most render crashes come from
   * one bad piece of state rather than a permanently broken tree.
   */
  fallback: (error: Error, reset: () => void) => ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Stops one component's render error from taking the whole app down to a blank
 * page. React unmounts the entire tree when nothing catches a render throw, so
 * without a boundary any bad component anywhere is a total outage.
 *
 * Still a class: getDerivedStateFromError and componentDidCatch have no hook
 * equivalent in React 19.
 *
 * Note what this does NOT catch — errors thrown in event handlers, in async
 * callbacks, or during server requests. Query failures are handled where they
 * happen, by the error states in each feature.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // The component stack is the useful half and never reaches window.onerror.
    console.error('[ui] render error', error, info.componentStack)
  }

  reset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    return error === null ? this.props.children : this.props.fallback(error, this.reset)
  }
}
