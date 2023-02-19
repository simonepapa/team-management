import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Spinner from "../components/Spinner"

function Register() {
  const onChange = () => {}

  const onSubmit = () => {}

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
              name="name"
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
              name="email"
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
              name="password"
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
              name="password2"
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
