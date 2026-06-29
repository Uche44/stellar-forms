import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App smoke test', () => {
  it('renders the landing page title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Collect Payments Directly on/i);
    expect(titleElement).toBeInTheDocument();
  });
});
