import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import CommentSection from '../CommentSection';

// Mock axios
jest.mock('axios');

describe('CommentSection Component', () => {
  const mockPostId = 1;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders comment section with title', () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<CommentSection postId={mockPostId} />);
    
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  test('renders empty state when no comments', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<CommentSection postId={mockPostId} />);
    
    await waitFor(() => {
      expect(screen.getByText('No comments yet.')).toBeInTheDocument();
    });
  });

  test('renders comments when they exist', async () => {
    const mockComments = [
      {
        id: 1,
        body: 'This is a test comment',
        author_name: 'testuser',
        author_id: 1
      },
      {
        id: 2,
        body: 'Another test comment',
        author_name: 'anotheruser',
        author_id: 2
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockComments });
    
    render(<CommentSection postId={mockPostId} />);
    
    await waitFor(() => {
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      expect(screen.getByText('Another test comment')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('anotheruser')).toBeInTheDocument();
    });
  });

  test('handles adding a new comment', async () => {
    const mockComments = [];
    const newComment = {
      id: 1,
      body: 'New comment',
      author_name: 'testuser',
      author_id: 1
    };
    
    axios.get.mockResolvedValueOnce({ data: mockComments });
    axios.post.mockResolvedValueOnce({ data: newComment });
    axios.get.mockResolvedValueOnce({ data: [newComment] });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
      },
      writable: true,
    });
    
    render(<CommentSection postId={mockPostId} />);
    
    const commentInput = screen.getByPlaceholderText('Add a comment');
    const submitButton = screen.getByRole('button', { name: /comment/i });
    
    fireEvent.change(commentInput, { target: { value: 'New comment' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `http://localhost:8000/comment/create?post_id=${mockPostId}`,
        { body: 'New comment' },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
    
    await waitFor(() => {
      expect(commentInput.value).toBe('');
    });
  });

  test('handles comment submission error', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('Failed to add comment'));
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
      },
      writable: true,
    });
    
    render(<CommentSection postId={mockPostId} />);
    
    const commentInput = screen.getByPlaceholderText('Add a comment');
    const submitButton = screen.getByRole('button', { name: /comment/i });
    
    fireEvent.change(commentInput, { target: { value: 'Test comment' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to add comment.')).toBeInTheDocument();
    });
  });

  test('handles deleting a comment', async () => {
    const mockComments = [
      {
        id: 1,
        body: 'Test comment to delete',
        author_name: 'testuser',
        author_id: 1
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockComments });
    axios.delete.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({ data: [] });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
      },
      writable: true,
    });
    
    render(<CommentSection postId={mockPostId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test comment to delete')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTitle('Delete comment');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8000/comment/delete/1',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });

  test('handles comment deletion error', async () => {
    const mockComments = [
      {
        id: 1,
        body: 'Test comment',
        author_name: 'testuser',
        author_id: 1
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockComments });
    axios.delete.mockRejectedValueOnce(new Error('Failed to delete comment'));
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
      },
      writable: true,
    });
    
    render(<CommentSection postId={mockPostId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTitle('Delete comment');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to delete comment.')).toBeInTheDocument();
    });
  });

  test('handles fetch comments error', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch comments'));
    
    render(<CommentSection postId={mockPostId} />);
    
    await waitFor(() => {
      expect(screen.getByText('No comments yet.')).toBeInTheDocument();
    });
  });

  test('requires comment input before submission', () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<CommentSection postId={mockPostId} />);
    
    const commentInput = screen.getByPlaceholderText('Add a comment');
    const submitButton = screen.getByRole('button', { name: /comment/i });
    
    expect(commentInput).toBeRequired();
  });

  test('shows avatar initials for comment authors', async () => {
    const mockComments = [
      {
        id: 1,
        body: 'Test comment',
        author_name: 'testuser',
        author_id: 1
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockComments });
    
    render(<CommentSection postId={mockPostId} />);
    
    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument(); // Avatar initial
    });
  });

  test('handles author name with special characters', async () => {
    const mockComments = [
      {
        id: 1,
        body: 'Test comment',
        author_name: 'user123',
        author_id: 1
      }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockComments });
    
    render(<CommentSection postId={mockPostId} />);
    
    await waitFor(() => {
      expect(screen.getByText('U')).toBeInTheDocument(); // Avatar initial
    });
  });
}); 