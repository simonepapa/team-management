import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import LightMode from "./LightMode"
import {
  BsHouseDoor,
  BsCheck2Circle,
  BsFileEarmarkMedical,
  BsPeople,
  BsBoxArrowLeft,
} from "react-icons/bs"

function Navigation() {
  const [checkbox, setCheckbox] = useState(true)

  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    document.body.classList.remove("overflow-y-hidden")
    document.documentElement.classList.remove("overflow-y-hidden")
    document.getElementById("sidebar").classList.remove("sidebar-wide")
    const checkbox = document.getElementById("burger")
    checkbox.checked = !checkbox
  }, [navigate])

  const handleMenu = () => {
    document.body.classList.toggle("overflow-y-hidden")
    document.documentElement.classList.toggle("overflow-y-hidden")
    document.getElementById("sidebar").classList.toggle("sidebar-wide")
    setCheckbox(!checkbox)
  }

  const onLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <>
      <header className="bg-base-100 w-screen fixed z-20">
        <div className="flex justify-between items-center px-4 xl:pl-0 py-4 w-screen xl:w-9/12 xl:mx-auto">
          <div className="logo text-xl xl:text-3xl">Team Management</div>
          <div className="hidden xl:flex items-center">
            {!user && (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? "font-bold text-xl mr-12" : "text-xl mr-12"
                  }
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive ? "font-bold text-xl mr-12" : "text-xl mr-12"
                  }
                >
                  Sign up
                </NavLink>
              </>
            )}
          </div>
          <label className="btn btn-circle btn-ghost swap swap-rotate xl:hidden burger">
            <input type="checkbox" id="burger" />
            <svg
              onClick={() => handleMenu()}
              className="w-6 h-6 swap-off fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
            </svg>
            <svg
              onClick={() => handleMenu()}
              className="w-6 h-6 swap-on fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
            </svg>
          </label>
        </div>
      </header>
      <div
        className="sidebar bg-base-100 flex flex-col items-center xl:items-stretch z-10"
        id="sidebar"
      >
        {user && (
          <>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "link-inactive sidebar-active flex items-center p-2 mx-3"
                  : "flex items-center p-2 mx-3"
              }
              style={{ marginTop: "5rem" }}
            >
              <div className="flex items-center">
                <BsHouseDoor className="nav-icon" />
                <p className="ml-2">Home</p>
              </div>
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                isActive
                  ? "link-inactive sidebar-active flex items-center mt-10 p-2 mx-3"
                  : "flex items-center mt-10 p-2 mx-3"
              }
            >
              <div className="flex items-center">
                <BsCheck2Circle className="nav-icon" />
                <p className="ml-2">Tasks</p>
              </div>
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive
                  ? "link-inactive sidebar-active flex items-center mt-10 p-2 mx-3"
                  : "flex items-center mt-10 p-2 mx-3"
              }
            >
              <div className="flex items-center">
                <BsFileEarmarkMedical className="nav-icon" />
                <p className="ml-2">Projects</p>
              </div>
            </NavLink>
            <NavLink
              to="/teams"
              className={({ isActive }) =>
                isActive
                  ? "link-inactive sidebar-active flex items-center mt-10 p-2 mx-3"
                  : "flex items-center mt-10 p-2 mx-3"
              }
            >
              <div className="flex items-center">
                <BsPeople className="nav-icon" />
                <p className="ml-2">Teams</p>
              </div>
            </NavLink>
          </>
        )}

        <div
          className="flex flex-col items-center xl:block"
          style={!user ? { marginTop: "5rem" } : { marginTop: "2.5rem" }}
        >
          <div className={`${user ? "hidden" : "xl:hidden"}`}>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "font-bold text-xl mb-10" : "text-xl mb-10"
              }
            >
              Log in
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? "font-bold text-xl mb-10" : "text-xl mb-10"
              }
            >
              Sign up
            </NavLink>
          </div>
          <LightMode />
        </div>

        {user && (
          <div
            onClick={onLogout}
            className="flex items-center p-2 mx-3 hover:cursor-pointer mt-auto mb-10"
          >
            <div className="flex items-center">
              <BsBoxArrowLeft className="nav-icon" />
              <p className="ml-2">Logout</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Navigation
