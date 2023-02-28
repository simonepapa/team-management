import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BsPlusCircle, BsXLg } from "react-icons/bs"
import { toast } from "react-toastify"
import DatePicker from "react-multi-date-picker"
import Modal from "react-modal"
import Spinner from "../components/Spinner"
import Card from "../components/Card"
import {
  useCreateProjectMutation,
  useGetProjectsQuery,
} from "../features/api/apiSlice"

Modal.setAppElement("#root")

function Projects() {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [dueDate, setDueDate] = useState(new Date())
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    team: "",
  })

  const {
    data: projects = [],
    isLoading,
    isFetching,
    isError,
    message,
  } = useGetProjectsQuery()
  const [createProject, { isCreating }] = useCreateProjectMutation()

  const navigate = useNavigate()

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const openModal = () => {
    setModalIsOpen(true)
  }

  const closeModal = () => {
    setModalIsOpen(false)
  }

  const onChange = (e) => {}

  const onSubmit = async (e) => {}

  if (isLoading || isFetching) {
    return (
      <div className="fullscreen-spinner">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Create team"
        className="w-11/12 md:w-9/12 xl:w-3/12 top-1/2 left-1/2 bottom-auto right-auto -translate-y-2/4 -translate-x-2/4 relative inset-y-1/2 rounded-lg bg-base-100 p-6 border border-base-100 overflow-y-auto max-h-75p"
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.65)", zIndex: "50" },
        }}
      >
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">New project</h2>
          <BsXLg className="ml-8 hover:cursor-pointer" onClick={closeModal} />
        </div>
        <div>
          <form onSubmit={onSubmit} className="flex flex-col items-center mt-2">
            <div className="flex flex-col w-screen max-w-xs">
              <p className="text-normal mb-1">Project name</p>
              <input
                onChange={onChange}
                required
                id="name"
                name="name"
                type="text"
                placeholder="Type project name here"
                className="input input-bordered w-screen max-w-xs"
              />
            </div>
            <div className="flex flex-col w-screen max-w-xs mt-3">
              <p className="text-normal mb-1">Team name</p>
              <select
                onChange={onChange}
                required
                id="team"
                name="team"
                defaultValue={""}
                className="select select-bordered font-normal w-fit-content"
              >
                <option disabled value="">
                  Select the team
                </option>
              </select>
            </div>
            <div className="flex flex-col w-screen max-w-xs mt-3">
              <p className="text-normal mb-1">Project description</p>
              <textarea
                onChange={onChange}
                required
                id="description"
                name="description"
                placeholder="Type project description here"
                className="textarea textarea-bordered w-screen max-w-xs"
              ></textarea>
            </div>
            <div className="flex flex-col w-screen max-w-xs mt-3">
              <p className="text-normal mb-1">Due date</p>
              <DatePicker
                id="dueDate"
                name="dueDate"
                inputClass="input input-bordered w-screen max-w-xs"
                value={""}
                onChange={setDueDate}
                placeholder="Select project due date here"
              />
            </div>
            <div className="w-full flex justify-between mt-8">
              <button className="btn">Create</button>
              <button onClick={closeModal} className="btn">
                Go back
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <main className="container flex flex-wrap pb-4 pt-24">
        <div className="text-xl breadcrumbs pb-6 grow w-screen truncate w-screen">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <p>Projects</p>
            </li>
          </ul>
        </div>
        <section
          className="shadow-common h-fit bg-base-100 rounded-lg px-6 pt-6 pb-12 mb-6"
          style={{ width: "90vw" }}
        >
          <h2 className="text-2xl text-base-content uppercase font-bold mb-6">
            My Projects
          </h2>
          <div
            onClick={openModal}
            className="flex items-center hover:cursor-pointer mb-8"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-base-300 rounded-lg mr-3">
              <BsPlusCircle className="w-8 h-8" />
            </div>
            <p className="text-lg text-base-content">Create new</p>
          </div>
          <div className="flex flex-wrap">
            {isLoading || isFetching ? (
              <Spinner />
            ) : (
              <>
                {projects.map((project) => (
                  <Link
                    key={project && project.id}
                    to={`/projects/${project.id}`}
                    title={project.name}
                  >
                    <Card
                      image="https://picsum.photos/200/300"
                      title={project.name && project.name}
                      teammates={project.members}
                      label={project.status}
                    />
                  </Link>
                ))}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  )
}

export default Projects
