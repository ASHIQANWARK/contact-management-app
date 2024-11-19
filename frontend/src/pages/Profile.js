import React, { useState, useEffect } from "react";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error fetching profile data");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8000/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error changing password");
      }

      const data = await response.json();
      setMessage(data.message);
      setError("");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Error changing password");
      setMessage("");
    }
  };

  if (!user) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Profile Page</h1>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Your Profile</h5>
          <p className="card-text">
            <strong>Name:</strong> {user.name}
          </p>
          <p className="card-text">
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>

      <h2 className="mb-4">Change Password</h2>
      <form onSubmit={handlePasswordChange} className="border p-4 rounded bg-light">
        <div className="mb-3">
          <label htmlFor="currentPassword" className="form-label">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        {message && <p className="text-success">{message}</p>}
        <button type="submit" className="btn btn-primary w-100">
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
