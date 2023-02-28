import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = JSON.parse(localStorage.getItem("user")).token

      // If we have a token set in state, let's assume that we should be passing it.
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }

      return headers
    },
  }),
  tagTypes: ['Team', 'Project'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (payload) => ({
        url: "/users",
        method: "POST",
        body: payload,
      }),
    }),
    login: builder.mutation({
      query: (payload) => ({
        url: "/users/login",
        method: "POST",
        body: payload,
      }),
    }),
    getUserTeamsLeader: builder.query({
      query: () => `/users/teams`,
      providesTags: ['Team'],
    }),
    createTeam: builder.mutation({
      query: (payload) => ({
        url: "/teams",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ['Team'],
    }),
    getTeams: builder.query({
      query: () => `/teams`,
      providesTags: ['Team'],
    }),
    getTeam: builder.query({
      query: (teamId) => `/teams/${teamId}`,
      providesTags: ['Team'],
    }),
    updateTeam: builder.mutation({
      query: (data) => {
        const { teamId, ...body } = data
        return {
          url: `/teams/${teamId}`,
          method: "PUT",
          body,
        }
      },
      invalidatesTags: ['Team']
    }),
    deleteTeam: builder.mutation({
      query: (data) => {
        const { teamId } = data
        return {
          url: `/teams/${teamId}`,
          method: "DELETE",
        }
      },
      invalidatesTags: ['Team'],
    }),
    addTeamMember: builder.mutation({
      query: (data) => {
        const { teamId, ...body } = data
        return {
          url: `/teams/${teamId}/members`,
          method: "POST",
          body
        }
      },
      invalidatesTags: ['Team'],
    }),
    updateTeamMember: builder.mutation({
      query: (data) => {
        const { teamId, ...body } = data
        return {
          url: `/teams/${teamId}/members`,
          method: "PUT",
          body
        }
      },
      invalidatesTags: ['Team'],
    }),
    removeTeamMember: builder.mutation({
      query: (data) => {
        const { teamId, ...body } = data
        return {
          url: `/teams/${teamId}/members`,
          method: "DELETE",
          body
        }
      },
      invalidatesTags: ['Team'],
    }),
    createProject: builder.mutation({
      query: (payload) => ({
        url: "/projects",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ['Project'],
    }),
    getProjects: builder.query({
      query: () => `/projects`,
      providesTags: ['Project'],
    }),
    getProject: builder.query({
      query: (projectId) => `/projects/${projectId}`,
      providesTags: ['Project'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetUserTeamsLeaderQuery,
  useCreateTeamMutation,
  useGetTeamsQuery,
  useGetTeamQuery,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useCreateProjectMutation,
  useGetProjectsQuery,
  useGetProjectQuery,
} = apiSlice
