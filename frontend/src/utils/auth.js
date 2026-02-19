// ===============================
// DEFAULT HARDCODED ADMIN
// ===============================
const DEFAULT_ADMIN = {
  username: "admin",
  email: "admin@gmail.com",
  password: "admin123",
  role: "ADMIN",
  photo: ""
};

// ===============================
// INITIALIZE ADMIN
// ===============================
export const initializeAdmin = () => {
  const users = JSON.parse(localStorage.getItem("allUsers")) || [];

  const adminExists = users.find(u => u.role === "ADMIN");

  if (!adminExists) {
    users.push(DEFAULT_ADMIN);
    localStorage.setItem("allUsers", JSON.stringify(users));
  }
};

// ===============================
// LOGGED USER SAVE / GET
// ===============================
export const saveUser = (user) => {
  localStorage.setItem("loggedUser", JSON.stringify(user));
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem("loggedUser"));
};

export const logout = () => {
  localStorage.removeItem("loggedUser");
};

// ===============================
// ALL USERS
// ===============================
export const getAllUsers = () => {
  return JSON.parse(localStorage.getItem("allUsers")) || [];
};

export const saveAllUsers = (users) => {
  localStorage.setItem("allUsers", JSON.stringify(users));
};

// ===============================
// REQUEST SYSTEM
// ===============================
export const saveRequest = (request) => {
  const requests = JSON.parse(localStorage.getItem("requests")) || [];

  const alreadyRequested = requests.find(
    r => r.username === request.username
  );

  if (alreadyRequested) {
    alert("You already sent request.");
    return;
  }

  requests.push(request);
  localStorage.setItem("requests", JSON.stringify(requests));
};

export const getRequests = () => {
  return JSON.parse(localStorage.getItem("requests")) || [];
};

export const removeRequest = (username) => {
  const requests = getRequests().filter(
    r => r.username !== username
  );
  localStorage.setItem("requests", JSON.stringify(requests));
};
