import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Navigation from "./components/Navigation"
import PrivateRoute from "./components/PrivateRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import Teams from "./pages/Teams"

function App() {
  return (
    <div className="bg-base-300 h-screen">
      <Router>
        <Navigation />
        <div className="bg-base-300 px-4 xl:px-0">
          <Routes>
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/" element={<Home />} />
            </Route>
            <Route path="/teams" element={<PrivateRoute />}>
              <Route path="/teams" element={<Teams />} />
            </Route>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </div>
  )
}

export default App
