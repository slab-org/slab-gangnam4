import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReservationPage from './Reservation';

const renderReservationPage = () => {
  render(
    <MemoryRouter>
      <ReservationPage />
    </MemoryRouter>
  );
};

beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('룸 예약 가격표는 새 시간당 가격을 보여준다', () => {
  renderReservationPage();

  const twoPersonRow = screen.getByRole('row', { name: /2인실/ });
  expect(within(twoPersonRow).getByText('8,000')).toBeInTheDocument();
  expect(within(twoPersonRow).getByText('16,000')).toBeInTheDocument();
  expect(within(twoPersonRow).getByText('24,000')).toBeInTheDocument();

  const fourPersonRow = screen.getByRole('row', { name: /4인실/ });
  expect(within(fourPersonRow).getByText('11,000')).toBeInTheDocument();
  expect(within(fourPersonRow).getByText('22,000')).toBeInTheDocument();
  expect(within(fourPersonRow).getByText('33,000')).toBeInTheDocument();
});

test('30분 증감 버튼은 새 시간당 가격의 절반을 사용한다', () => {
  renderReservationPage();

  expect(screen.getByRole('button', { name: '+2인실 30분 (+4,000)' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '-2인실 30분 (-4,000)' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '+4인실 30분 (+5,500)' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '-4인실 30분 (-5,500)' })).toBeInTheDocument();
});

test('룸 예약 신청 양식 복사 문구는 새 시간당 가격을 안내한다', async () => {
  renderReservationPage();

  fireEvent.click(screen.getByRole('button', { name: '룸 예약 신청 양식 복사' }));

  await waitFor(() => {
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('- 2인실: 8,000원'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('- 4인실: 11,000원'));
  });
  expect(navigator.clipboard.writeText).not.toHaveBeenCalledWith(expect.stringContaining('- 2인실: 6,000원'));
  expect(navigator.clipboard.writeText).not.toHaveBeenCalledWith(expect.stringContaining('- 4인실: 9,000원'));
});
