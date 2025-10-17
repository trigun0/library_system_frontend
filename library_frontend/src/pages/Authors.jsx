import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import bookImage from "../assets/book.jpg";
import { getAuthors, createAuthor, deleteAuthor, updateAuthor } from "../api"; // ✅ added updateAuthor

function Authors() {
  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await getAuthors();
      setAuthors(response.data);
    } catch (error) {
      console.error("Error fetching authors:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not load authors.",
        background: "#1f2937",
        color: "#e5e7eb",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !biography.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in both fields.",
        background: "#1f2937",
        color: "#e5e7eb",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const newAuthor = { name, biography };

    try {
      const response = await createAuthor(newAuthor);
      setAuthors([...authors, response.data]);
      setName("");
      setBiography("");
      setShowTable(true);

      Swal.fire({
        icon: "success",
        title: "Author Added",
        timer: 1500,
        showConfirmButton: false,
        background: "#1f2937",
        color: "#e5e7eb",
      });
    } catch (error) {
      console.error("Error creating author:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not add author.",
        background: "#1f2937",
        color: "#e5e7eb",
      });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Author?",
      text: "Are you sure you want to remove this author?",
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
          await deleteAuthor(id);
          setAuthors(authors.filter((a) => a.id !== id));
          Swal.fire({
            icon: "success",
            title: "Deleted",
            timer: 1200,
            showConfirmButton: false,
            background: "#1f2937",
            color: "#e5e7eb",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Could not delete author.",
            background: "#1f2937",
            color: "#e5e7eb",
          });
        }
      }
    });
  };

  // ✅ Edit author
  const handleEdit = async (author) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Author",
      html: `
        <input id="name" class="swal2-input bg-gray-800 text-gray-100 border border-gray-700" placeholder="Author name" value="${author.name}">
        <textarea id="bio" class="swal2-textarea bg-gray-800 text-gray-100 border border-gray-700" placeholder="Biography">${author.biography}</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      background: "#1f2937",
      color: "#e5e7eb",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const name = document.getElementById("name").value.trim();
        const bio = document.getElementById("bio").value.trim();
        if (!name || !bio) {
          Swal.showValidationMessage("Both fields are required!");
        }
        return { name, biography: bio };
      },
    });

    if (formValues) {
      try {
        const response = await updateAuthor(author.id, formValues);
        setAuthors(
          authors.map((a) =>
            a.id === author.id ? { ...a, ...response.data } : a
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Author details updated successfully.",
          timer: 1500,
          showConfirmButton: false,
          background: "#1f2937",
          color: "#e5e7eb",
        });
      } catch (error) {
        console.error("Error updating author:", error);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Could not update author.",
          background: "#1f2937",
          color: "#e5e7eb",
        });
      }
    }
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
          Author Management
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-2xl font-semibold mb-5 text-blue-300">
          Add New Author
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Author Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 transition"
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Biography
            </label>
            <textarea
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-4 py-2 h-28 resize-none focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 transition"
              placeholder="Enter author biography"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md hover:shadow-blue-700/50"
          >
            ➕ Add Author
          </button>
        </form>
      </div>

      {/* Authors Table */}
      <div className="max-w-5xl mx-auto mt-14">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-blue-300">Author List</h3>
          {showTable && authors.length > 0 && (
            <button
              onClick={() => setShowTable(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-semibold transition"
            >
              hide ✖
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
          <p className="text-gray-400 text-center">Loading authors...</p>
        ) : authors.length === 0 ? (
          <p className="text-gray-400 text-center italic">
            No authors found. Add one above.
          </p>
        ) : (
          showTable && (
            <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-md">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white uppercase text-sm">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Author Name</th>
                    <th className="px-6 py-3">Biography</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {authors.map((author, index) => (
                    <tr
                      key={author.id}
                      className="border-t border-gray-800 hover:bg-gray-800/60 transition duration-200"
                    >
                      <td className="px-6 py-3 text-gray-400">{index + 1}</td>
                       <td className="px-6 py-3 font-medium text-blue-300">
                        {author.name}
                      </td>
                      <td className="px-6 py-3 text-gray-300">
                        {author.biography}
                      </td>
                      <td className="px-6 py-3 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(author)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700
                          rounded-md shadow-sm hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-200 ease-in-out "
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(author.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs transition"
                        >
                          ✖ Delete
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

export default Authors;
