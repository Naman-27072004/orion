import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const ProblemChild = () => {
  throw new Error('Test crash inside component');
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal Component Rendered</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Component Rendered')).toBeInTheDocument();
  });

  it('renders fallback UI when a child component throws an error', () => {
    // Suppress console.error log for intentional error thrown in test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallbackTitle="Custom Module Error">
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Module Error')).toBeInTheDocument();
    expect(screen.getByText(/Test crash inside component/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
