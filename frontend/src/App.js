import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function App() {
  return (
    <div className="bg-base-300 h-screen">
      <Router>
        <div className="bg-base-300 px-4 xl:px-0">
          <Routes>
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </div>
  )
}

export default App
