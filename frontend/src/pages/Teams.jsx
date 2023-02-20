import { useEffect } from "react"
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
    return <Spinner />
  }

  return (
    <div>Teams</div>
  )
}

export default Teams