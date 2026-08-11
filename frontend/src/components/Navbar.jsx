import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", available: false },
  { label: "Upload Meeting", path: "/upload", available: true },
  { label: "Meeting History", path: "/history", available: false },
];

function getLinkClassName(isActive) {
  let className = "navbar__link";

  if (isActive) {
    className += " navbar__link--active";
  }

  return className;
}

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link
          className="navbar__brand"
          to="/upload"
          aria-label="MeetFlow AI upload page"
        >
          <span className="navbar__logo" aria-hidden="true">
            MF
          </span>
          <span className="navbar__product-name">MeetFlow AI</span>
        </Link>

        <nav className="navbar__navigation" aria-label="Main navigation">
          <ul className="navbar__links">
            {navigationItems.map((item) => (
              <li key={item.path}>
                {item.available ? (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      getLinkClassName(isActive)
                    }
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <span
                    className="navbar__link navbar__link--unavailable"
                    aria-disabled="true"
                    title="Coming soon"
                  >
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__profile">
          <span className="navbar__avatar" aria-hidden="true">
            U
          </span>
          <span className="navbar__profile-details">
            <strong>Student User</strong>
            <small>Profile</small>
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
