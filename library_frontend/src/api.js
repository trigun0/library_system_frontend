import axios from "axios";

// ✅ Base URL for your Django backend API
const API_BASE_URL = "http://127.0.0.1:8000/api/";

// ✅ Create a reusable Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================= AUTHORS =======================
export const getAuthors = () => api.get("authors/");
export const createAuthor = (authorData) => api.post("authors/", authorData);
export const updateAuthor = (id, authorData) => api.put(`authors/${id}/`, authorData);
export const deleteAuthor = (id) => api.delete(`authors/${id}/`);

// ======================= GENRES =======================
export const getGenres = () => api.get("genres/");
export const createGenre = (genreData) => api.post("genres/", genreData);
export const updateGenre = (id, genreData) => api.put(`genres/${id}/`, genreData);
export const deleteGenre = (id) => api.delete(`genres/${id}/`);

// ======================= BOOKS =======================
export const getBooks = () => api.get("books/");
export const createBook = (bookData) => api.post("books/", bookData);
export const updateBook = (id, bookData) => api.put(`books/${id}/`, bookData);
export const deleteBook = (id) => api.delete(`books/${id}/`);

// ======================= BORROWS =======================
export const getBorrows = () => api.get("borrows/");
export const createBorrow = (borrowData) => api.post("borrows/", borrowData);
export const updateBorrow = (id, borrowData) => api.put(`borrows/${id}/`, borrowData);
export const deleteBorrow = (id) => api.delete(`borrows/${id}/`);

export default api;
