import { useState, useEffect } from "react"
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
  useGetUncompletedTasksQuery
} from "../features/api/apiSlice"

function Tasks() {
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
          <div className="flex flex-wrap items-center py-2">
            <div className="flex">
              <BsPlusCircle className="mr-3 w-6 h-auto hover:cursor-pointer hover:fill-info" />
            </div>
          </div>
        </section>
        <section className="shadow-common h-fit bg-base-100 rounded-lg px-6 pt-6 pb-2 mb-6 z-0 w-screen overflow-x-scroll xl:overflow-x-auto xl:w-45vw">
          <h2 className="text-2xl text-base-content font-bold mb-6">
            COMPLETED
          </h2>
        </section>
      </main>
    </>
  )
}

export default Tasks
