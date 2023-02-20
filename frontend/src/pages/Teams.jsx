import { useEffect } from "react"
import { Link } from "react-router-dom"
import { BsPlusCircle } from "react-icons/bs"
import { toast } from "react-toastify"
import Spinner from "../components/Spinner"
import { useGetTeamsQuery } from "../features/api/apiSlice"

function Teams() {
  const {
    data: teams = [],
    isLoading,
    isError,
    message,
  } = useGetTeamsQuery()

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  if (isLoading) {
    return (
      <div className="fullscreen-spinner">
        <Spinner />
      </div>
    )
  }

  return (
    <main className="container flex flex-wrap pb-4 pt-24">
        <div className="text-xl breadcrumbs pb-6 grow w-screen truncate w-screen">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <p>Teams</p>
            </li>
          </ul>
        </div>
        <section
          className="shadow-common h-fit bg-base-100 rounded-lg px-6 pt-6 pb-12 mb-6"
          style={{ width: "90vw" }}
        >
          <h2 className="text-2xl text-base-content uppercase font-bold mb-6">
            My Team
          </h2>
          <div
            className="flex items-center hover:cursor-pointer mb-8"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-base-300 rounded-lg mr-3">
              <BsPlusCircle className="w-8 h-8" />
            </div>
            <p className="text-lg text-base-content">Create new</p>
          </div>
          <div className="flex flex-wrap">
            
          </div>
        </section>
      </main>
  )
}

export default Teams