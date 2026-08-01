import { Component } from 'react';
import ErrorPage from '../../pages/ErrorPage';
import {
  isDynamicImportError,
  recoverDynamicImportError,
} from '../../utils/dynamicImport';

export default class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
    recoverDynamicImportError(error);
  }

  resetError = () => {
    if (isDynamicImportError(this.state.error)) {
      window.location.reload();
      return;
    }
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <ErrorPage
          error={error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}
