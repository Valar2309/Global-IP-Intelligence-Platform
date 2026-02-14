import { useState, useEffect } from "react";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePic: "",
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setUser({ ...user, profilePic: reader.result });
    };

    if (file) reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
    setEditing(false);
    alert("Profile Updated!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile</h2>

        <img
          src={user.profilePic || "https://via.placeholder.com/150"}
          alt="profile"
          className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-blue-400 mb-4"
        />

        {editing ? (
          <div className="flex flex-col gap-3">
            <input
              type="file"
              onChange={handleImage}
              className="text-sm"
            />

            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleSave}
              className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Save
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Name:</span> {user.name}
            </p>

            <p className="text-gray-700 mb-4">
              <span className="font-semibold">Email:</span> {user.email}
            </p>

            <button
              onClick={() => setEditing(true)}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
