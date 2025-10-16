import { NavLink, Link } from "react-router-dom";

function Navbar() {
  const linkStyle =
    "text-gray-300 hover:text-blue-400 font-medium transition duration-200";
  const activeStyle =
    "text-blue-400 font-semibold border-b-2 border-blue-500 pb-1";

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left - Logo / Title */}
        <Link to="/" className="flex items-center space-x-2">
        <img src="/lms.png" alt="LMS Logo" className="w-8 h-8" />
        <span className="text-2xl font-bold text-blue-400 hover:text-blue-500 transition duration-200">
            Library System

        </span>
        </Link>

        {/* Right - Navigation Links */}
        <div className="space-x-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? activeStyle : linkStyle
            }
          >
            Authors
          </NavLink>
          <NavLink
            to="/genres"
            className={({ isActive }) =>
              isActive ? activeStyle : linkStyle
            }
          >
            Genres
          </NavLink>
          <NavLink
            to="/books"
            className={({ isActive }) =>
              isActive ? activeStyle : linkStyle
            }
          >
            Books
          </NavLink>
          <NavLink
            to="/borrow"
            className={({ isActive }) =>
              isActive ? activeStyle : linkStyle
            }
          >
            Borrow
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              isActive ? activeStyle : linkStyle
            }
          >
            Reports
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
