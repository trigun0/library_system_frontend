import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import bookImage from "../assets/book.jpg";
import { getBorrows, createBorrow, deleteBorrow, getBooks } from "../api";

function BorrowRecords() {
  const [borrowerName, setBorrowerName] = useState("");
  const [bookId, setBookId] = useState("");
  const [rentedDays, setRentedDays] = useState("");
  const [charges, setCharges] = useState("");
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [borrowsRes, booksRes] = await Promise.all([
        getBorrows(),
        getBooks(),
      ]);
      setBorrows(borrowsRes.data);
      setBooks(booksRes.data);
    } catch (error) {
      console.error("Error fetching borrow records:", error);
      Swal.fire({
        icon: "error",
        title: "Backend Error",
        text: "Failed to load borrow data.",
        background: "#1f2937",
        color: "#e5e7eb",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!borrowerName || !bookId || !rentedDays || !charges) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
        background: "#1f2937",
        color: "#e5e7eb",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    const newBorrow = {
      borrower_name: borrowerName,
      book_id: bookId,
      rented_days: rentedDays,
      charges: charges,
    };

    try {
      const response = await createBorrow(newBorrow);
      setBorrows([...borrows, response.data]);
      setBorrowerName("");
      setBookId("");
      setRentedDays("");
      setCharges("");

      Swal.fire({
        icon: "success",
        title: "Borrow Record Added",
        timer: 1500,
        showConfirmButton: false,
        background: "#1f2937",
        color: "#e5e7eb",
      });
    } catch (error) {
      console.error("Error creating borrow:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not add borrow record.",
        background: "#1f2937",
        color: "#e5e7eb",
      });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove Record?",
      text: "Are you sure you want to delete this borrow record?",
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
          await deleteBorrow(id);
          setBorrows(borrows.filter((b) => b.id !== id));
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Borrow record deleted.",
            timer: 1300,
            showConfirmButton: false,
            background: "#1f2937",
            color: "#e5e7eb",
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Could not delete record.",
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
          alt="Borrow Icon"
          className="w-20 h-20 mb-3 rounded-lg shadow-[0_0_15px_3px_rgba(59,130,246,0.4)] hover:scale-105 transition-transform duration-300"
        />
        <h1 className="text-4xl font-bold text-blue-400 drop-shadow-lg">
          Borrow Records
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-2xl font-semibold mb-5 text-blue-300">
          Add Borrow Record
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Borrower Name
            </label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter borrower name"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-2">Book</label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Book</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Rented Days
              </label>
              <input
                type="number"
                value={rentedDays}
                onChange={(e) => setRentedDays(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 5"
                min="1"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Charges (₹)
              </label>
              <input
                type="number"
                value={charges}
                onChange={(e) => setCharges(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 100"
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md hover:shadow-blue-700/50"
          >
            ➕ Add Record
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto mt-14">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-blue-300">
            Borrow Records
          </h3>
          {showTable && borrows.length > 0 && (
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
          <p className="text-gray-400 text-center">Loading records...</p>
        ) : borrows.length === 0 ? (
          <p className="text-gray-400 text-center italic">
            No borrow records found.
          </p>
        ) : (
          showTable && (
            <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-md">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white uppercase text-sm">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Borrower</th>
                    <th className="px-6 py-3">Book</th>
                    <th className="px-6 py-3">Borrowed On</th>
                    <th className="px-6 py-3">Days</th>
                    <th className="px-6 py-3">Charges</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrows.map((b, index) => (
                    <tr
                      key={b.id}
                      className="border-t border-gray-800 hover:bg-gray-800/60 transition duration-200"
                    >
                      <td className="px-6 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-6 py-3 text-blue-300 font-medium">
                        {b.borrower_name}
                      </td>
                      <td className="px-6 py-3 text-gray-300">
                        {b.book?.title || "N/A"}
                      </td>
                      <td className="px-6 py-3 text-gray-400">
                        {b.borrowed_on}
                      </td>
                      <td className="px-6 py-3 text-gray-400">
                        {b.rented_days}
                      </td>
                      <td className="px-6 py-3 text-gray-400">₹{b.charges}</td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleDelete(b.id)}
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

export default BorrowRecords;
