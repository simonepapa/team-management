import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useLoginMutation } from "../features/api/apiSlice"
import Spinner from "../components/Spinner"

function Login() {
  const [login, { isLoading }] = useLoginMutation()

  const [formData, setFormData] = useState({
    userEmail: "",
    userPassword: "",
  })

  const navigate = useNavigate()

  const { userEmail, userPassword } = formData

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    const userData = {
      email: userEmail,
      password: userPassword,
    }

    // Use mutation and immediately check if it's successful (redirect to "/") or not (toast the error)
    login(userData)
      .unwrap()
      .then(() => navigate("/"))
      .catch((error) => toast.error(error.data.message))
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <main className="container flex flex-wrap justify-center mx-auto pb-4 pt-24">
      <form onSubmit={onSubmit} className="flex flex-col items-center">
        <div className="mb-8">
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
        <div className="mb-8">
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
        <button className="btn px-8">Submit</button>
      </form>
    </main>
  )
}

export default Login
