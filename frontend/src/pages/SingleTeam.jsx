import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import Modal from "react-modal"
import { toast } from "react-toastify"
import { BsPlusCircle, BsPencil } from "react-icons/bs"
import Spinner from "../components/Spinner"
import {
  useGetTeamQuery,
} from "../features/api/apiSlice"

function SingleTeam() {
  const params = useParams()

  const { data: team = [], isLoading, isError, message } = useGetTeamQuery(params.teamId)

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
    <>

    </>
  )
}

export default SingleTeam