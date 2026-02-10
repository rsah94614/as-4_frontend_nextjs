//Placeholder , figma framework will come soon and it will be ready according to the api contract
export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  window.location.href = "/login";
}
