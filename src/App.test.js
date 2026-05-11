import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('./supabaseClient', () => ({
  supabase: {},
}));

test('renders the landing page tools', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText('에스랩 강남 4호점 유틸')).toBeInTheDocument();
  expect(screen.getByText('룸 예약 도구')).toBeInTheDocument();
  expect(screen.getByText('회원 안내 도구')).toBeInTheDocument();
});
