function Login() {
  const onChange = (e) => {}

  const onSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <main className="container flex flex-wrap justify-center pb-4 pt-24">
      <form onSubmit={onSubmit} className="flex flex-col items-center">
        <div className="mb-8">
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
        <div className="mb-8">
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
        <button className="btn px-8">Submit</button>
      </form>
    </main>
  )
}

export default Login
