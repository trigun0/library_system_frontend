import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import bookImage from "../assets/book.jpg";
import { getGenres, createGenre, deleteGenre } from "../api";

function Genres() {
  const [name, setName] = useState("");
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);

  // Fetch genres on page load
  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await getGenres();
      setGenres(response.data);
    } catch (error) {
      console.error("Error fetching genres:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to load genres from backend!",
        background: "#1f2937",
        color: "#e5e7eb",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new genre
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Field",
        text: "Please enter a genre name.",
        background: "#1f2937",
        color: "#e5e7eb",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const newGenre = { name };

    try {
      const response = await createGenre(newGenre);
      setGenres([...genres, response.data]);
      setName("");
      setShowTable(true);
      Swal.fire({
        icon: "success",
        title: "Genre Added!",
        text: "New genre has been added successfully.",
        timer: 1500,
        showConfirmButton: false,
        background: "#1f2937",
        color: "#e5e7eb",
      });
    } catch (error) {
      console.error("Error creating genre:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not add genre.",
        background: "#1f2937",
        color: "#e5e7eb",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  // Delete genre with confirmation
  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove Genre?",
      text: "Are you sure you want to remove this genre?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove",
      background: "#1f2937",
      color: "#e5e7eb",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteGenre(id);
          setGenres(genres.filter((g) => g.id !== id));
          Swal.fire({
            icon: "success",
            title: "Removed!",
            text: "Genre has been removed.",
            timer: 1500,
            showConfirmButton: false,
            background: "#1f2937",
            color: "#e5e7eb",
          });
        } catch (error) {
          console.error("Error deleting genre:", error);
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Could not delete genre.",
            background: "#1f2937",
            color: "#e5e7eb",
            confirmButtonColor: "#3b82f6",
          });
        }
      }
    });
  };

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 p-6">
      {/* Page Title */}
      <div className="flex flex-col items-center justify-center mb-10">
        <img
          src={bookImage}
          alt="book Icon"
          className="w-20 h-20 mb-3 rounded-lg shadow-[0_0_15px_3px_rgba(59,130,246,0.4)] hover:scale-105 transition-transform duration-300"
        />
        <h1 className="text-4xl font-bold text-blue-400 drop-shadow-lg">
          Genre Management
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-2xl font-semibold mb-5 text-blue-300">
          Add New Genre
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Genre Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 transition"
              placeholder="Enter genre name"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md hover:shadow-blue-700/50"
          >
            ➕ Add Genre
          </button>
        </form>
      </div>

      {/* Genres Table */}
      <div className="max-w-5xl mx-auto mt-14">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-blue-300">Genre List</h3>

          {showTable && genres.length > 0 && (
            <button
              onClick={() => setShowTable(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-semibold transition"
            >
              Close ✖
            </button>
          )}
          {!showTable && (
            <button
              onClick={() => setShowTable(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-semibold transition"
            >
              Show 📋
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Loading genres...</p>
        ) : genres.length === 0 ? (
          <p className="text-gray-400 text-center italic">
            No genres found. Add one above.
          </p>
        ) : (
          showTable && (
            <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-md">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white uppercase text-sm">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Genre Name</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {genres.map((genre, index) => (
                    <tr
                      key={genre.id}
                      className="border-t border-gray-800 hover:bg-gray-800/60 transition duration-200"
                    >
                      <td className="px-6 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-6 py-3 font-medium text-blue-300">
                        {genre.name}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleDelete(genre.id)}
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

export default Genres;
