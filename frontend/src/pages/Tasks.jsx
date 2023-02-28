import { useState, useEffect, useRef } from "react"
import { toast } from "react-toastify"
import { BsPlusCircle } from "react-icons/bs"
import Spinner from "../components/Spinner"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import Drawer from "react-modern-drawer"
import "react-modern-drawer/dist/index.css"
import {
  useGetCompletedTasksQuery,
  useGetUncompletedTasksQuery,
} from "../features/api/apiSlice"

function Tasks() {
  const gridRef = useRef()
  const [completedRowData, setCompletedRowData] = useState([])
  const [uncompletedRowData, setUncompletedRowData] = useState([])

  const [taskColumns] = useState([
    { field: "name", sortable: true, resizable: true, width: 250 },
    { field: "priority", sortable: true, resizable: false, width: 120 },
    { field: "dueDate", sortable: true, resizable: false, width: 150 },
    { field: "project", sortable: true, resizable: true, width: 211 },
  ])

  const defaultColDef = {
    suppressMovable: true,
  }

  const {
    data: completedTasks = [],
    isLoadingCompleted,
    isFetchingCompleted,
    isErrorCompleted,
    messageCompleted,
  } = useGetCompletedTasksQuery()
  const {
    data: uncompletedTasks = [],
    isLoadingUncompleted,
    isFetchingUncompleted,
    isErrorUncompleted,
    messageUncompleted,
  } = useGetUncompletedTasksQuery()

  useEffect(() => {
    if (isErrorCompleted) {
      toast.error(messageCompleted)
    }

    if (isErrorUncompleted) {
      toast.error(messageUncompleted)
    }
  }, [
    isErrorCompleted,
    messageCompleted,
    isErrorUncompleted,
    messageUncompleted,
  ])

  useEffect(() => {
    if (!isLoadingUncompleted && !isFetchingUncompleted) {
      if (uncompletedRowData.length === 0) {
        uncompletedTasks.map((task) => {
          setUncompletedRowData((current) => [
            ...current,
            {
              id: task.id,
              name: task.name,
              priority: task.priority,
              dueDate: new Date(task.dueDate).toLocaleDateString("en-EN", {
                day: "numeric",
                month: "short",
              }),
              project: task.project,
            },
          ])
        })
      } else {
        setUncompletedRowData([])
      }
    }
  }, [isLoadingUncompleted, isFetchingUncompleted, uncompletedTasks])

  console.log(uncompletedTasks)

  return (
    <>
      <main className="container flex flex-wrap pb-4 pt-24">
        <div className="text-xl breadcrumbs pb-6 grow w-screen truncate w-screen">
          <ul>
            <li>
              <p>Home</p>
            </li>
            <li>
              <p>Tasks</p>
            </li>
          </ul>
        </div>
        <section className="shadow-common h-fit bg-base-100 rounded-lg px-6 pt-6 pb-2 mb-6 z-0 w-screen overflow-x-scroll xl:overflow-x-auto xl:w-45vw">
          <h2 className="text-2xl text-base-content font-bold mb-6">TO DO</h2>
          <div
            className="ag-theme-alpine-dark project-table"
            style={{ height: 400 }}
          >
            <AgGridReact
              ref={gridRef}
              defaultColDef={defaultColDef}
              rowData={uncompletedRowData}
              columnDefs={taskColumns}
              pagination={true}
              paginationPageSize={10}
            ></AgGridReact>
          </div>
          <div className="flex flex-wrap items-center mt-4 py-2">
            <div className="flex">
              <BsPlusCircle className="mr-3 w-6 h-auto hover:cursor-pointer hover:fill-info" />
            </div>
          </div>
        </section>
        <section className="shadow-common h-fit bg-base-100 rounded-lg px-6 pt-6 pb-6 mb-6 z-0 w-screen overflow-x-scroll xl:overflow-x-auto xl:w-45vw">
          <h2 className="text-2xl text-base-content font-bold mb-6">
            COMPLETED
          </h2>
          <div
            className="ag-theme-alpine-dark project-table"
            style={{ height: 400 }}
          >
            <AgGridReact
              ref={gridRef}
              defaultColDef={defaultColDef}
              rowData={completedRowData}
              columnDefs={taskColumns}
              pagination={true}
              paginationPageSize={10}
            ></AgGridReact>
          </div>
        </section>
      </main>
    </>
  )
}

export default Tasks
