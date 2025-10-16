import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import bookImage from "../assets/book.jpg";
import {
  getBooks,
  createBook,
  deleteBook,
  getAuthors,
  getGenres,
} from "../api";

function Books() {
  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [genreId, setGenreId] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [availableCopies, setAvailableCopies] = useState(1);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);

  // ✅ Fetch data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [booksRes, authorsRes, genresRes] = await Promise.all([
        getBooks(),
        getAuthors(),
        getGenres(),
      ]);
      setBooks(booksRes.data);
      setAuthors(authorsRes.data);
      setGenres(genresRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      Swal.fire({
        icon: "error",
        title: "Error loading data",
        text: "Backend connection failed.",
        background: "#1f2937",
        color: "#e5e7eb",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new book
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !authorId || !genreId || !publishedDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all required fields.",
        background: "#1f2937",
        color: "#e5e7eb",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const newBook = {
      title,
      author_id: authorId,
      genre_id: genreId,
      published_date: publishedDate,
      available_copies: availableCopies,
    };

    try {
      const response = await createBook(newBook);
      setBooks([...books, response.data]);
      setTitle("");
      setAuthorId("");
      setGenreId("");
      setPublishedDate("");
      setAvailableCopies(1);

      Swal.fire({
        icon: "success",
        title: "Book Added",
        text: "Book added successfully!",
        timer: 1500,
        showConfirmButton: false,
        background: "#1f2937",
        color: "#e5e7eb",
      });
    } catch (error) {
      console.error("Error adding book:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to add book.",
        background: "#1f2937",
        color: "#e5e7eb",
      });
    }
  };

  // ✅ Delete book
  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Book?",
      text: "Are you sure you want to remove this book?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#1f2937",
      color: "#e5e7eb",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBook(id);
          setBooks(books.filter((b) => b.id !== id));
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Book removed successfully.",
            timer: 1300,
            showConfirmButton: false,
            background: "#1f2937",
            color: "#e5e7eb",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Could not delete book.",
            background: "#1f2937",
            color: "#e5e7eb",
          });
        }
      }
    });
  };

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 p-6">
      {/* Title */}
      <div className="flex flex-col items-center justify-center mb-10">
        <img
          src={bookImage}
          alt="Book Icon"
          className="w-20 h-20 mb-3 rounded-lg shadow-[0_0_15px_3px_rgba(59,130,246,0.4)] hover:scale-105 transition-transform duration-300"
        />
        <h1 className="text-4xl font-bold text-blue-400 drop-shadow-lg">
          Book Management
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-2xl font-semibold mb-5 text-blue-300">
          Add New Book
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter book title"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Author
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Author</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Genre
              </label>
              <select
                value={genreId}
                onChange={(e) => setGenreId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Genre</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Published Date
              </label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Available Copies
              </label>
              <input
                type="number"
                value={availableCopies}
                onChange={(e) => setAvailableCopies(e.target.value)}
                min="1"
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md hover:shadow-blue-700/50"
          >
            ➕ Add Book
          </button>
        </form>
      </div>

      {/* Books Table */}
      <div className="max-w-6xl mx-auto mt-14">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-blue-300">Book List</h3>
          {showTable && books.length > 0 && (
            <button
              onClick={() => setShowTable(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition"
            >
              Close ✖
            </button>
          )}
          {!showTable && (
            <button
              onClick={() => setShowTable(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition"
            >
              Show 📋
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Loading books...</p>
        ) : books.length === 0 ? (
          <p className="text-gray-400 text-center italic">
            No books found. Add one above.
          </p>
        ) : (
          showTable && (
            <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-md">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white uppercase text-sm">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Author</th>
                    <th className="px-6 py-3">Genre</th>
                    <th className="px-6 py-3">Published</th>
                    <th className="px-6 py-3">Copies</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book, index) => (
                    <tr
                      key={book.id}
                      className="border-t border-gray-800 hover:bg-gray-800/60 transition duration-200"
                    >
                      <td className="px-6 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-6 py-3 font-medium text-blue-300">
                        {book.title}
                      </td>
                      <td className="px-6 py-3 text-gray-300">
                        {book.author?.name || "N/A"}
                      </td>
                      <td className="px-6 py-3 text-gray-300">
                        {book.genre?.name || "N/A"}
                      </td>
                      <td className="px-6 py-3 text-gray-400">
                        {book.published_date}
                      </td>
                      <td className="px-6 py-3 text-gray-400">
                        {book.available_copies}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs transition"
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Books;
