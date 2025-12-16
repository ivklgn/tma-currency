import {
  Component,
  type ComponentType,
  type GetDerivedStateFromError,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { tmaCurrencyMiniAppError } from '../errors';

export interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode | ComponentType<{ error: unknown }>;
}

interface ErrorBoundaryState {
  error?: unknown;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError: GetDerivedStateFromError<
    ErrorBoundaryProps,
    ErrorBoundaryState
  > = (error) => ({ error });

  componentDidCatch(error: Error) {
    tmaCurrencyMiniAppError('FrontendLogicError', 'React component render failed', {
      originalError: error,
    }).emit({ extendedParams: { componentStack: error.stack } });
    this.setState({ error });
  }

  render() {
    const {
      state: { error },
      props: { fallback: Fallback, children },
    } = this;

    return 'error' in this.state ? (
      typeof Fallback === 'function' ? (
        <Fallback error={error} />
      ) : (
        Fallback
      )
    ) : (
      children
    );
  }
}
