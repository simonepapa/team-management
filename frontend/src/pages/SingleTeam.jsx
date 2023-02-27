import { useState, useEffect, useRef } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Modal from "react-modal"
import { toast } from "react-toastify"
import { BsPlusCircle, BsPencil, BsXLg } from "react-icons/bs"
import Spinner from "../components/Spinner"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import TeamMember from "../components/TeamMember"
import {
  useGetTeamQuery,
  useUpdateTeamMutation,
  useDeleteTeamMutation
} from "../features/api/apiSlice"

Modal.setAppElement("#root")

function SingleTeam() {
  const gridRef = useRef()
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false)
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [projectRowData, setProjectRowData] = useState([])

  const [projectColumns] = useState([
    { field: "name", sortable: true, resizable: true, maxWidth: 466 },
    { field: "status", sortable: true, resizable: false, width: 120 },
    { field: "dueDate", sortable: true, resizable: false, width: 150 },
  ])

  const defaultColDef = {
    sortable: true,
    resizable: true,
  }

  const params = useParams()
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem("user"))

  const {
    data: teamObject = [],
    isLoading,
    isError,
    message,
    refetch,
  } = useGetTeamQuery(params.teamId)
  const [updateTeam, { isUpdating }] = useUpdateTeamMutation()
  const [deleteTeam, { isDeleting }] = useDeleteTeamMutation()

  const { team, projects, users: members, leader } = teamObject

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  useEffect(() => {
    if (!isLoading) {
      if (projectRowData.length === 0) {
        Object.keys(projects).length !== 0 &&
          projects.map((project) => {
            setProjectRowData((current) => [
              ...current,
              {
                id: project.id,
                name: project.name,
                status: project.status,
                dueDate: new Date(project.dueDate).toLocaleDateString("en-EN", {
                  day: "numeric",
                  month: "short",
                }),
              },
            ])
          })
      } else {
        setProjectRowData([])
      }
    }
  }, [isLoading])

  const projectRedirect = (e) => {
    navigate(`/projects/${e.data.id}`)
  }

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

  const onChange = (e) => {
    setName((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  // Update project info
  const onUpdate = (e) => {
    e.preventDefault()
    updateTeam({ teamId: params.teamId, name: name.teamName })
      .unwrap()
      .then(() => {
        refetch()
        closeUpdateModal()
      })
      .catch((error) => toast.error(error.data.message))
  }

  if (isLoading) {
    return (
      <div className="fullscreen-spinner">
        <Spinner />
      </div>
    )
  }

  console.log(params.teamId)

  return (
    <>
      <Modal
        isOpen={updateModalIsOpen}
        onRequestClose={closeUpdateModal}
        contentLabel="Create team"
        className="w-11/12 md:w-9/12 xl:w-3/12 top-1/2 left-1/2 bottom-auto right-auto -translate-y-2/4 -translate-x-2/4 relative inset-y-1/2 rounded-lg bg-base-100 p-6 border border-base-100 overflow-y-auto max-h-75p"
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.65)", zIndex: "50" },
        }}
      >
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Update team</h2>
          <BsXLg
            className="ml-8 hover:cursor-pointer"
            onClick={closeUpdateModal}
          />
        </div>
        {!isUpdating ? (
          <div>
            <form
              onSubmit={onUpdate}
              className="flex flex-col items-center mt-2"
            >
              <div className="flex flex-col w-screen max-w-xs">
                <p className="text-normal mb-1">Team image</p>
                <input
                  type="file"
                  className="file-input file-input-bordered file-input-xs w-full max-w-xs"
                />
              </div>
              <div className="flex flex-col w-screen max-w-xs mt-3">
                <p className="text-normal mb-1">Team name</p>
                <input
                  required
                  id="teamName"
                  name="teamName"
                  type="text"
                  onChange={onChange}
                  placeholder="Type team name here"
                  className="input input-bordered w-screen max-w-xs"
                />
              </div>
              <div className="w-full flex justify-between mt-8">
                <button type="submit" className="btn">
                  Update
                </button>
                <button
                  type="button"
                  onClick={closeUpdateModal}
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

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        contentLabel={`Delete team`}
        className="w-11/12 md:w-9/12 xl:w-3/12 top-1/2 left-1/2 bottom-auto right-auto -translate-y-2/4 -translate-x-2/4 relative inset-y-1/2 rounded-lg bg-base-100 p-6 border border-base-100 overflow-y-auto max-h-75p"
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.65)", zIndex: "50" },
        }}
      >
        {!isDeleting ? (
          <>
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold">Delete {team.name}</h2>
              <BsXLg
                className="ml-8 hover:cursor-pointer"
                onClick={closeDeleteModal}
              />
            </div>
            <div>
              <p>
                Are you sure you want to delete {team.name}? This will also
                delete all of its projects.
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() =>
                    deleteTeam({ teamId: params.teamId})
                      .unwrap()
                      .then(() => {
                        closeDeleteModal()
                        navigate("/teams")
                      })
                      .catch((error) => toast.error(error.data.message))
                  }
                  className="btn"
                >
                  Delete
                </button>
                <button onClick={closeDeleteModal} className="btn">
                  Go back
                </button>
              </div>
            </div>
          </>
        ) : (
          <Spinner />
        )}
      </Modal>

      <main className="container flex flex-wrap pb-4 pt-24">
        <div className="text-xl breadcrumbs pb-6 grow w-screen truncate">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/teams">Teams</Link>
            </li>
            <li>
              <p>{team.name}</p>
            </li>
          </ul>
        </div>
        <section
          className="shadow-common h-fit bg-base-100 rounded-lg p-6"
          style={{ width: "90vw" }}
        >
          <div className="flex items-center">
            <div className="flex items-center w-full">
              <img
                src="https://picsum.photos/200/300"
                alt="project thumbnail"
                className="max-w-8 w-full h-8 rounded-lg"
              />
              <h2 className="text-2xl text-base-content uppercase font-bold ml-4 mr-3 max-w-75p">
                {team.name}
              </h2>
              <BsPencil
                onClick={() => openUpdateModal()}
                className="max-w-8 w-full h-8 hover:cursor-pointer"
              />
            </div>
          </div>
          <div className="flex flex-col mt-4">
            <h3 className="text-xl font-bold mb-4">Teammates</h3>
            <div className="flex flex-wrap hover:cursor-pointer">
              <div className="flex items-center mr-6 mb-2 w-36">
                <div className="flex items-center justify-center bg-base-300 rounded-full w-9 h-9 mr-1">
                  <BsPlusCircle className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <p className="text-normal font-bold">New member</p>
                </div>
              </div>
              {Object.keys(members).length !== 0 &&
                members.map((member) => (
                  <TeamMember key={member.id} member={member} />
                ))}
            </div>
          </div>
          <div className="flex flex-col mt-4">
            <h3 className="text-xl font-bold mb-4">Projects</h3>
            <div
              className="ag-theme-alpine-dark project-table"
              style={{ height: 400 }}
            >
              <AgGridReact
                ref={gridRef}
                defaultColDef={defaultColDef}
                rowData={projectRowData}
                columnDefs={projectColumns}
                onCellClicked={projectRedirect}
              ></AgGridReact>
            </div>
          </div>
          {leader[0].userId === user.id && (
            <button onClick={openDeleteModal} className="btn btn-outline mt-10">
              Delete team
            </button>
          )}
        </section>
      </main>
    </>
  )
}

export default SingleTeam
