
import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h4>Une erreur est survenue. Veuillez réessayer.</h4>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;