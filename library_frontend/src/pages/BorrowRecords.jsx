import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import bookImage from "../assets/book.jpg";
import { getBorrows, createBorrow, deleteBorrow, getBooks, updateBorrow } from "../api";

function BorrowRecords() {
  const [borrowerName, setBorrowerName] = useState("");
  const [bookId, setBookId] = useState("");
  const [rentedDays, setRentedDays] = useState("");
  const [charges, setCharges] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const FINE_PER_DAY = 10; // 💰 Fine per overdue day

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [borrowsRes, booksRes] = await Promise.all([getBorrows(), getBooks()]);
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

  // ✅ Add or update record
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!borrowerName || !bookId || !rentedDays || !charges || !borrowDate) {
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

    const borrowData = {
      borrower_name: borrowerName,
      book_id: bookId,
      rented_days: rentedDays,
      charges: charges,
      borrowed_on: borrowDate, // ✅ fixed field name
      return_date: returnDate || null,
    };

    try {
      if (editingId) {
        await updateBorrow(editingId, borrowData);
        Swal.fire({
          icon: "success",
          title: "Record Updated",
          timer: 1500,
          showConfirmButton: false,
          background: "#1f2937",
          color: "#e5e7eb",
        });
      } else {
        const response = await createBorrow(borrowData);
        setBorrows([...borrows, response.data]);
        Swal.fire({
          icon: "success",
          title: "Borrow Record Added",
          timer: 1500,
          showConfirmButton: false,
          background: "#1f2937",
          color: "#e5e7eb",
        });
      }
      resetForm();
      fetchAllData();
    } catch (error) {
      console.error("Error saving borrow record:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not save record.",
        background: "#1f2937",
        color: "#e5e7eb",
      });
    }
  };

  const resetForm = () => {
    setBorrowerName("");
    setBookId("");
    setRentedDays("");
    setCharges("");
    setBorrowDate("");
    setReturnDate("");
    setEditingId(null);
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

  const handleEdit = (record) => {
    setEditingId(record.id);
    setBorrowerName(record.borrower_name);
    setBookId(record.book?.id || "");
    setRentedDays(record.rented_days);
    setCharges(record.charges);
    setBorrowDate(record.borrowed_on || "");
    setReturnDate(record.return_date || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Calculate total days, overdue days & fine
  const calculateFine = (borrowed_on, return_date, rented_days, baseCharge) => {
    if (!borrowed_on) return { daysTaken: "—", totalCharge: baseCharge };

    const start = new Date(borrowed_on);
    const end = return_date ? new Date(return_date) : new Date();
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const overdue = diffDays > rented_days ? diffDays - rented_days : 0;
    const fine = overdue * FINE_PER_DAY;
    const totalCharge = parseFloat(baseCharge) + fine;

    return {
      daysTaken: `${diffDays}${overdue > 0 ? ` (+${overdue} overdue)` : ""}`,
      totalCharge: totalCharge.toFixed(2),
    };
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
      <div className="max-w-3xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-2xl font-semibold mb-5 text-blue-300">
          {editingId ? "Edit Borrow Record" : "Add Borrow Record"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Borrower + Book */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Borrow Date
              </label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Days + Charges */}
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
                Base Charge (₹)
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

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-200 shadow-md hover:shadow-blue-700/50"
            >
              {editingId ? "💾 Update Record" : "➕ Add Record"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto mt-14">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-blue-300">Borrow Records</h3>
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
                    <th className="px-6 py-3">Borrow Date</th>
                    <th className="px-6 py-3">Return Date</th>
                    <th className="px-6 py-3 text-center">Days Taken</th>
                    <th className="px-6 py-3">Total (₹)</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrows.map((b, index) => {
                    const { daysTaken, totalCharge } = calculateFine(
                      b.borrowed_on,
                      b.return_date,
                      b.rented_days,
                      b.charges
                    );
                    return (
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
                        <td className="px-6 py-3 text-gray-400">{b.borrowed_on}</td>
                        <td className="px-6 py-3 text-gray-400">
                          {b.return_date || <span className="text-gray-500">Not returned</span>}
                        </td>
                        <td className="px-6 py-3 text-center text-gray-400">{daysTaken}</td>
                        <td className="px-6 py-3 text-gray-400">₹{totalCharge}</td>
                        <td className="px-6 py-3 text-center flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(b)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700
                            rounded-md shadow-sm hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-200 ease-in-out "
                          >
                            ✏ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition"
                          >
                            ✖ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
