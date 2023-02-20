import { BsPeople, BsListUl } from "react-icons/bs"

function Card({ image, title, teammates, tasks, label }) {
  return (
    <div className="bg-base-300 w-64 rounded-lg mr-6 mb-8 border border-white/25">
      <img src={image} alt="thumbnail" className="rounded-t-lg w-64 h-56" />
      <div className="flex flex-wrap items-center mt-2 ml-2 mb-4">
        <h3 className="text-xl text-base-content font-bold mb-1 line-clamp">{title}</h3>
        {label && (
          <div
            className={`${
              label === "On track"
                ? "bg-success text-success-content"
                : label === "Late"
                ? "bg-warning text-warning-content"
                : "bg-error text-error-content"
            } rounded-lg text-xs py-1 px-3 ml-3`}
          >
            {label}
          </div>
        )}
      </div>
      <div className="flex flex-wrap pb-5 ml-2">
        <div className="flex flex-wrap items-center mr-6">
          <BsPeople className="w-5 mr-2" />
          <p className="text-xs">{teammates} teammate{teammates > 1 && "s"}</p>
        </div>
        {tasks && (
          <div className="flex flex-wrap items-center">
            <BsListUl className="w-5 mr-2" />
            <p className="text-xs">{tasks} tasks</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Card