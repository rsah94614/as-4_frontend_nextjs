export interface User {
  id: string; // UUID to match backend receiver_id
  name: string;
}

// Placeholder UUIDs until backend team/employee endpoint is ready
export const loggedInUser: User = {
  id: "880e8400-e29b-41d4-a716-446655440000",
  name: "Gautam Hazarika",
};

export const teamMembers: User[] = [
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Bikash Barman" },
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "Rajesh Prasad" },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "Dipam Nath" },
  { id: "550e8400-e29b-41d4-a716-446655440004", name: "Bikash Barman" },
];

export const teamLeader: User = {
  id: "550e8400-e29b-41d4-a716-446655440005",
  name: "John Doe",
};
