import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAuthors, getGenres, getBooks, getBorrows } from "../api";
import bookImage from "../assets/book.jpg";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Reports() {
  const [stats, setStats] = useState({
    authors: 0,
    genres: 0,
    books: 0,
    borrows: 0,
    availableCopies: 0,
  });
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  const FINE_PER_DAY = 10; // 💰 Same fine rate as BorrowRecords.jsx

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [authorsRes, genresRes, booksRes, borrowsRes] = await Promise.all([
        getAuthors(),
        getGenres(),
        getBooks(),
        getBorrows(),
      ]);

      const totalAvailable = booksRes.data.reduce(
        (sum, b) => sum + (b.available_copies || 0),
        0
      );

      setStats({
        authors: authorsRes.data.length,
        genres: genresRes.data.length,
        books: booksRes.data.length,
        borrows: borrowsRes.data.length,
        availableCopies: totalAvailable,
      });

      setBorrows(borrowsRes.data);
    } catch (error) {
      console.error("Error loading reports:", error);
      Swal.fire({
        icon: "error",
        title: "Error Loading Reports",
        text: "Failed to fetch data from backend.",
        background: "#1f2937",
        color: "#e5e7eb",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: "Authors", value: stats.authors },
    { name: "Genres", value: stats.genres },
    { name: "Books", value: stats.books },
    { name: "Borrows", value: stats.borrows },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b"];

  // ✅ Fine Calculation (same logic as BorrowRecords.jsx)
  const calculateFine = (borrowed_on, return_date, rented_days, baseCharge) => {
    if (!borrowed_on) return { daysTaken: "—", overdue: 0, totalCharge: baseCharge };

    const start = new Date(borrowed_on);
    const end = return_date ? new Date(return_date) : new Date();
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const overdue = diffDays > rented_days ? diffDays - rented_days : 0;
    const fine = overdue * FINE_PER_DAY;
    const totalCharge = parseFloat(baseCharge) + fine;

    return { daysTaken: diffDays, overdue, totalCharge };
  };

  return (
    <div className="bg-gray-950 min-h-screen text-gray-200 p-6">
      {/* Title */}
      <div className="flex flex-col items-center justify-center mb-10">
        <img
          src={bookImage}
          alt="Report Icon"
          className="w-20 h-20 mb-3 rounded-lg shadow-[0_0_15px_3px_rgba(59,130,246,0.4)] hover:scale-105 transition-transform duration-300"
        />
        <h1 className="text-4xl font-bold text-blue-400 drop-shadow-lg">
          Library Reports
        </h1>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center text-lg">Loading reports...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl text-center hover:shadow-blue-700/40 transition">
              <h3 className="text-xl font-semibold text-blue-300">Authors</h3>
              <p className="text-4xl font-bold text-blue-400 mt-2">{stats.authors}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl text-center hover:shadow-green-700/40 transition">
              <h3 className="text-xl font-semibold text-green-300">Genres</h3>
              <p className="text-4xl font-bold text-green-400 mt-2">{stats.genres}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl text-center hover:shadow-indigo-700/40 transition">
              <h3 className="text-xl font-semibold text-indigo-300">Books</h3>
              <p className="text-4xl font-bold text-indigo-400 mt-2">{stats.books}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl text-center hover:shadow-yellow-700/40 transition">
              <h3 className="text-xl font-semibold text-yellow-300">Borrow Records</h3>
              <p className="text-4xl font-bold text-yellow-400 mt-2">{stats.borrows}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl text-center hover:shadow-cyan-700/40 transition col-span-1 sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-semibold text-cyan-300">Available Copies</h3>
              <p className="text-4xl font-bold text-cyan-400 mt-2">{stats.availableCopies}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-900 max-w-4xl mx-auto p-8 rounded-2xl border border-gray-800 shadow-xl mb-12">
            <h2 className="text-2xl font-semibold text-blue-300 mb-5 text-center">
              Data Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#e5e7eb",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Borrow Reports Table */}
          <div className="bg-gray-900 max-w-6xl mx-auto p-8 rounded-2xl border border-gray-800 shadow-xl">
            <h2 className="text-2xl font-semibold text-yellow-300 mb-6 text-center">
              Borrowers & Due Reports
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white uppercase text-sm">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-800">#</th>
                    <th className="py-3 px-4 border-b border-gray-800">Borrower</th>
                    <th className="py-3 px-4 border-b border-gray-800">Book</th>
                    <th className="py-3 px-4 border-b border-gray-800">Borrowed On</th>
                    <th className="py-3 px-4 border-b border-gray-800">Return Date</th>
                    <th className="py-3 px-4 border-b border-gray-800 text-center">Days Taken</th>
                    <th className="py-3 px-4 border-b border-gray-800 text-center">Overdue</th>
                    <th className="py-3 px-4 border-b border-gray-800 text-center">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {borrows.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-gray-500 py-4">
                        No borrow records found.
                      </td>
                    </tr>
                  ) : (
                    borrows.map((b, i) => {
                      const { daysTaken, overdue, totalCharge } = calculateFine(
                        b.borrowed_on,
                        b.return_date,
                        b.rented_days,
                        b.charges
                      );

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-gray-800/60 transition duration-200"
                        >
                          <td className="py-3 px-4 border-b border-gray-800 text-gray-400">{i + 1}</td>
                          <td className="py-3 px-4 border-b border-gray-800 text-blue-300 font-medium">
                            {b.borrower_name}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-800 text-gray-300">
                            {b.book?.title || "N/A"}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-800 text-gray-400">
                            {b.borrowed_on}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-800 text-gray-400">
                            {b.return_date || <span className="text-gray-500">Not returned</span>}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-800 text-center text-gray-400">
                            {daysTaken}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-800 text-center">
                            {overdue > 0 ? (
                              <span className="text-red-400 font-semibold">+{overdue}</span>
                            ) : (
                              <span className="text-green-400">0</span>
                            )}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-800 text-center text-blue-400 font-semibold">
                            ₹{totalCharge}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
