import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Modal from "react-modal"
import { toast } from "react-toastify"
import { BsPlusCircle, BsPencil } from "react-icons/bs"
import Spinner from "../components/Spinner"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import TeamMember from "../components/TeamMember"
import { useGetTeamQuery } from "../features/api/apiSlice"

function SingleTeam() {
  const gridRef = useRef()
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

  const {
    data: teamObject = [],
    isLoading,
    isError,
    message,
  } = useGetTeamQuery(params.teamId)

  const { team, projects, users: members } = teamObject

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

  if (isLoading) {
    return (
      <div className="fullscreen-spinner">
        <Spinner />
      </div>
    )
  }

  return (
    <>
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
              <BsPencil className="max-w-8 w-full h-8 hover:cursor-pointer" />
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
        </section>
      </main>
    </>
  )
}

export default SingleTeam
