import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Modal from "react-modal"
import { toast } from "react-toastify"
import { BsPlusCircle, BsPencil, BsXLg } from "react-icons/bs"
import Spinner from "../components/Spinner"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import Drawer from "react-modern-drawer"
import "react-modern-drawer/dist/index.css"
import TeamMember from "../components/TeamMember"
import {
  useGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddProjectMemberMutation,
  useUpdateProjectMemberMutation,
  useRemoveProjectMemberMutation,
} from "../features/api/apiSlice"

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
  const [updateProject, { isUpdatingProject }] = useUpdateProjectMutation()
  const [deleteProject, { isDeleting }] = useDeleteProjectMutation()
  const [addMember, { isAdding }] = useAddProjectMemberMutation()
  const [updateMember] = useUpdateProjectMemberMutation()
  const [removeMember] = useRemoveProjectMemberMutation()

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

  const onAddMemberChange = (e) => {
    setEmail((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  // Add member
  const onAddMember = (e) => {
    e.preventDefault()
    addMember({ projectId: params.projectId, email: email.memberEmail })
      .unwrap()
      .then(() => {
        closeAddMemberModal()
      })
      .catch((error) => toast.error(error.data.message))
  }

  const toggleDrawer = () => {
    setDrawerIsOpen((prevState) => !prevState)
  }

  const setupDrawer = (name, email, role) => {
    setMemberData(() => ({
      name: name,
      email: email,
      role: role,
    }))
    setConfirmRemove(false)

    toggleDrawer()
  }

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
        isOpen={addMemberModalIsOpen}
        onRequestClose={closeAddMemberModal}
        contentLabel="Add member"
        className="w-11/12 md:w-fit top-1/2 left-1/2 bottom-auto right-auto -translate-y-2/4 -translate-x-2/4 relative inset-y-1/2 rounded-lg bg-base-100 p-6 border border-base-100 overflow-y-auto max-h-75p"
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.65)", zIndex: "50" },
        }}
      >
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">New member</h2>
          <BsXLg
            className="ml-8 hover:cursor-pointer"
            onClick={closeAddMemberModal}
          />
        </div>
        {!isAdding ? (
          <div>
            <form
              onSubmit={onAddMember}
              className="flex flex-col items-center mt-2"
            >
              <div className="flex flex-col w-screen max-w-xs">
                <p className="text-normal mb-1">Email</p>
                <input
                  onChange={onAddMemberChange}
                  required
                  id="memberEmail"
                  name="memberEmail"
                  type="email"
                  placeholder="Type member email here"
                  className="input input-bordered w-screen max-w-xs"
                />
              </div>
              <div className="w-full flex justify-between mt-8">
                <button type="submit" className="btn">
                  Add
                </button>
                <button
                  type="button"
                  onClick={closeAddMemberModal}
                  className="btn"
                >
                  Go back
                </button>
              </div>
            </form>
          </div>
        ) : (
          <Spinner />
        )}
      </Modal>

      <Drawer
        open={drawerIsOpen}
        onClose={toggleDrawer}
        direction="right"
        className="drawer"
      >
        <div className="bg-base-100 h-screen p-10">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">{memberData.name}</h2>
            <BsXLg className="hover:cursor-pointer" onClick={toggleDrawer} />
          </div>
          <div className="flex items-center mt-5">
            <h3 className="text-normal font-bold">Email: </h3>
            <p className="text-normal ml-1">{memberData.email}</p>
          </div>
          <div className="flex items-center mt-5">
            <h3 className="text-normal font-bold mr-1">Role: </h3>
            {leader[0].userId === user.id ? (
              <form>
                <select
                  id="memberRole"
                  name="memberRole"
                  defaultValue={memberData.role}
                  className="select select-ghost w-fit-content max-w-xs font-normal"
                >
                  <option value="Project leader">Project leader</option>
                  <option value="Co-leader">Co-leader</option>
                  <option value="Collaborator">Collaborator</option>
                </select>
                <button type="submit" className="btn btn-sm btn-outline">
                  Save
                </button>
              </form>
            ) : (
              <p className="text-normal">{memberData.role}</p>
            )}
          </div>
          {leader[0].userId === user.id && !confirmRemove && (
            <button
              onClick={() => setConfirmRemove(true)}
              className="btn btn-outline mt-10"
            >
              Remove from project
            </button>
          )}
          {leader[0].userId === user.id && confirmRemove && (
            <div className="mt-4">
              <p>
                Are you sure you want to remove {memberData.name} from the
                project?
              </p>
              <div className="flex justify-between mt-4">
                <form>
                  <button type="submit" className="btn">
                    Remove member
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(false)}
                  className="btn"
                >
                  Go back
                </button>
              </div>
            </div>
          )}
        </div>
      </Drawer>

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
            <p className="text-xl">{team[0].name}</p>
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
              {Object.keys(members).length !== 0 &&
                members.map((member) => (
                  <TeamMember
                    onClick={() =>
                      setupDrawer(member.name, member.email, member.role)
                    }
                    key={member.id}
                    member={member}
                  />
                ))}
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
