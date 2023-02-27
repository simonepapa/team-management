function TeamMember({ onClick, member }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center mr-6 mb-2 w-36 hover:cursor-pointer"
    >
      <div
        className={`${
          (member.role === "Team leader" || member.role === "Project leader")
            ? "bg-primary-focus"
            : member.role === "Co-leader"
            ? "bg-secondary-focus"
            : "bg-accent-focus"
        }
      w-9 h-9 rounded-full mr-2`}
      ></div>
      <div className="flex flex-col">
        <p className="text-normal font-bold">{member.name}</p>
        <p className="text-xs">{member.role}</p>
      </div>
    </div>
  )
}

export default TeamMember
