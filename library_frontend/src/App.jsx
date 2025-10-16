import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Authors from "./pages/Authors";
import Genres from "./pages/Genres";
import Books from "./pages/Books";
import BorrowRecords from "./pages/BorrowRecords";
import Reports from "./pages/Reports";



function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Authors />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/books" element={<Books />} />
        <Route path="/borrow" element={<BorrowRecords />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
