import { Component } from 'react';
import ErrorPage from '../../pages/ErrorPage';

export default class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <ErrorPage
          error={error}
          resetError={() => this.setState({ error: null })}
        />
      );
    }

    return this.props.children;
  }
}
