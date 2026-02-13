export interface User {
  id: number
  name: string
}

export const loggedInUser: User = {
  id: 99,
  name: "Gautam Hazarika",
}

export const teamMembers: User[] = [
  { id: 1, name: "Bikash Barman" },
  { id: 2, name: "Rajesh Prasad" },
  { id: 3, name: "Dipam Nath" },
  { id: 4, name: "Bikash Barman" },
]

export const teamLeader: User = {
  id: 5,
  name: "John Doe",
}
