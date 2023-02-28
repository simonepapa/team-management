import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Modal from "react-modal"
import { toast } from "react-toastify"
import { BsPlusCircle, BsPencil } from "react-icons/bs"
import Spinner from "../components/Spinner"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import Drawer from "react-modern-drawer"
import "react-modern-drawer/dist/index.css"
import TeamMember from "../components/TeamMember"
import { useGetProjectQuery } from "../features/api/apiSlice"

Modal.setAppElement("#root")

function SingleProject() {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [addMemberModalIsOpen, setAddMemberModalIsOpen] = useState(false)
  const [drawerIsOpen, setDrawerIsOpen] = useState(false)
  const [memberData, setMemberData] = useState({
    name: "",
    email: "",
    role: "",
  })
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [confirmRemove, setConfirmRemove] = useState(false)

  const params = useParams()
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  const {
    data: projectObject = [],
    isLoading,
    isFetching,
    isError,
    message,
  } = useGetProjectQuery(params.projectId)

  const { project, users: members, team, leader } = projectObject

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const openUpdateModal = () => {
    setUpdateModalIsOpen(true)
  }

  const closeUpdateModal = () => {
    setUpdateModalIsOpen(false)
  }

  const openDeleteModal = () => {
    setDeleteModalIsOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false)
  }

  const openAddMemberModal = () => {
    setAddMemberModalIsOpen(true)
  }

  const closeAddMemberModal = () => {
    setAddMemberModalIsOpen(false)
  }

  if (isLoading || isFetching) {
    return (
      <div className="fullscreen-spinner">
        <Spinner />
      </div>
    )
  }

  console.log(projectObject)

  return (
    <>
      <main className="container flex flex-wrap pb-4 pt-24">
        <div className="text-xl breadcrumbs pb-6 grow w-screen truncate w-screen">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/projects">Projects</Link>
            </li>
            <li>
              <p>{project.name}</p>
            </li>
          </ul>
        </div>
        <section
          className="shadow-common h-fit bg-base-100 rounded-lg p-6"
          style={{ width: "90vw" }}
        >
          <div className="flex flex-row items-center">
            <div className="flex items-center w-full">
              <img
                src="https://picsum.photos/200/300"
                alt="project thumbnail"
                className="max-w-8 w-full h-8 rounded-lg"
              />
              <h2 className="text-2xl text-base-content uppercase font-bold ml-4 mr-3 max-w-75p">
                {project.name}
              </h2>
              <BsPencil className="max-w-8 w-full h-8 hover:cursor-pointer mr-7" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <h3 className="text-xl font-bold mr-1">Status:</h3>
            <div
              className={`${
                project.status === "On track"
                  ? "bg-success text-success-content"
                  : project.status === "Late"
                  ? "bg-warning text-warning-content"
                  : "bg-error text-error-content"
              } text-xs py-1 px-3 rounded-lg w-fit mt-2 xl:mt-0`}
            >
              {project.status}
            </div>
          </div>
          <div className="flex mt-4">
            <h3 className="text-xl font-bold mr-1">Team:</h3>
            <p className="text-xl">{team.name && team.name}</p>
          </div>
          <div className="flex items-center mt-4">
            <h3 className="text-xl font-bold mr-1">Due date:</h3>
            <p className="text-xl">
              {project.dueDate &&
                new Date(project.dueDate).toLocaleDateString("en-EN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
            </p>
          </div>
          <div className="flex flex-col mt-4">
            <h3 className="text-xl font-bold mb-4">Teammates</h3>
            <div className="flex flex-wrap hover:cursor-pointer">
              <div
                onClick={() => openAddMemberModal()}
                className="flex items-center mr-6 mb-2 w-36"
              >
                <div className="flex items-center justify-center bg-base-300 rounded-full w-9 h-9 mr-1">
                  <BsPlusCircle className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <p className="text-normal font-bold">New member</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-4">
            <div className="flex items-center mb-3">
              <h3 className="text-xl font-bold">Description</h3>
            </div>
            <p className="max-w-2xl	text-normal text-base-content">
              {project.description}
            </p>
          </div>
          <div className="flex flex-col mt-4">
            <h3 className="text-xl font-bold mb-4">Tasks</h3>
          </div>
        </section>
      </main>
    </>
  )
}

export default SingleProject
