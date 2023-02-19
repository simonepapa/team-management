import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useRegisterMutation } from "../features/api/apiSlice"
import Spinner from "../components/Spinner"

function Register() {
  const [register, { isLoading }] = useRegisterMutation()
  
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPassword: "",
    userPassword2: "",
  })

  const navigate = useNavigate()

  const { userName, userEmail, userPassword, userPassword2 } = formData

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (userPassword !== userPassword2) {
      toast.error("Passwords do not match")
    } else {
      const userData = {
        name: userName,
        email: userEmail,
        password: userPassword,
      }

      // Use mutation and immediately check if it's successful (redirect to "/") or not (toast the error)
      register(userData)
        .unwrap()
        .then(() => navigate("/"))
        .catch((error) => toast.error(error.data.message))
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <main className="container flex flex-wrap justify-center mx-auto pb-4 pt-24">
      <form onSubmit={onSubmit} className="flex flex-col items-center">
        <div className="flex justify-center w-full">
          <div className="mb-8 mr-4">
            <p className="text-normal mb-2">Name</p>
            <input
              onChange={onChange}
              required
              id="name"
              name="userName"
              type="text"
              placeholder="Type your name here"
              className="input w-full max-w-xs"
            />
          </div>
          <div className="mb-8 ml-4">
            <p className="text-normal mb-2">Email</p>
            <input
              onChange={onChange}
              required
              id="email"
              name="userEmail"
              type="email"
              placeholder="Type your email here"
              className="input w-full max-w-xs"
            />
          </div>
        </div>
        <div className="flex justify-center w-full">
          <div className="mb-8 mr-4">
            <p className="text-normal mb-2">Password</p>
            <input
              onChange={onChange}
              required
              id="password"
              name="userPassword"
              type="password"
              placeholder="Type your password here"
              className="input w-full max-w-xs"
            />
          </div>
          <div className=" ml-4">
            <p className="text-normal mb-2">Confirm password</p>
            <input
              onChange={onChange}
              required
              id="password2"
              name="userPassword2"
              type="password"
              placeholder="Confirm password"
              className="input w-full max-w-xs"
            />
          </div>
        </div>
        <button className="btn px-8">Submit</button>
      </form>
    </main>
  )
}

export default Register
