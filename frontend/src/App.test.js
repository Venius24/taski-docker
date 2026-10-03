import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

test('saves a task and refreshes after a 204 delete', async () => {
  axios.get
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: [{ id: 1, title: 'Read', description: 'Book', completed: false }] })
    .mockResolvedValueOnce({ data: [] });
  axios.post.mockResolvedValue({ data: { id: 1 } });
  axios.delete.mockResolvedValue({ status: 204 });

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Read' } });
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Book' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Read')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  await waitFor(() => expect(screen.queryByText('Read')).not.toBeInTheDocument());
  expect(axios.delete).toHaveBeenCalledWith('/api/tasks/1/');
});
