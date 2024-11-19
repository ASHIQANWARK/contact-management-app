import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ToastContext from "../context/ToastContext";

const CreateContact = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);

  const [userDetails, setUserDetails] = useState({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
    },
    email: "",
    phone: "",
    notes: "",
    birthday: "",
    tags: "",
    favorite: false,
  });

  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name.includes("address")) {
      const [_, key] = name.split(".");
      setUserDetails({
        ...userDetails,
        address: { ...userDetails.address, [key]: value },
      });
    } else if (name === "favorite") {
      setUserDetails({
        ...userDetails,
        [name]: checked,
      });
    } else if (name === "tags") {
      setUserDetails({
        ...userDetails,
        [name]: value.split(",").map((tag) => tag.trim()),
      });
    } else if (name === "birthday") {
      setUserDetails({
        ...userDetails,
        [name]: value,
      });
    } else {
      setUserDetails({ ...userDetails, [name]: value });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await fetch(`http://localhost:8000/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(userDetails),
      });
      const result = await res.json();
      if (!result.error) {
        toast.success(`Created [${userDetails.name}] contact`);
        setUserDetails({
          name: "",
          address: { street: "", city: "", state: "", postalCode: "" },
          email: "",
          phone: "",
          notes: "",
          birthday: "",
          tags: "",
          favorite: false,
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred while creating the contact.");
    }
  };

  return (
    <>
      <h2>Create Your Contact</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nameInput" className="form-label mt-4">
            Name Of Person
          </label>
          <input
            type="text"
            className="form-control"
            id="nameInput"
            name="name"
            value={userDetails.name}
            onChange={handleInputChange}
            placeholder="name"
            required
          />
        </div>
        <fieldset>
          <legend className="mt-4">Address</legend>
          <div className="form-group">
            <label htmlFor="streetInput" className="form-label">
              Street
            </label>
            <input
              type="text"
              className="form-control"
              id="streetInput"
              name="address.street"
              value={userDetails.address.street}
              onChange={handleInputChange}
              placeholder="street"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cityInput" className="form-label">
              City
            </label>
            <input
              type="text"
              className="form-control"
              id="cityInput"
              name="address.city"
              value={userDetails.address.city}
              onChange={handleInputChange}
              placeholder="palakkad"
            />
          </div>
          <div className="form-group">
            <label htmlFor="stateInput" className="form-label">
              State
            </label>
            <input
              type="text"
              className="form-control"
              id="stateInput"
              name="address.state"
              value={userDetails.address.state}
              onChange={handleInputChange}
              placeholder="kerala"
            />
          </div>
          <div className="form-group">
            <label htmlFor="postalCodeInput" className="form-label">
              Postal Code
            </label>
            <input
              type="text"
              className="form-control"
              id="postalCodeInput"
              name="address.postalCode"
              value={userDetails.address.postalCode}
              onChange={handleInputChange}
              placeholder="627044"
            />
          </div>
        </fieldset>
        <div className="form-group">
          <label htmlFor="emailInput" className="form-label mt-4">
            Email Of Person
          </label>
          <input
            type="email"
            className="form-control"
            id="emailInput"
            name="email"
            value={userDetails.email}
            onChange={handleInputChange}
            placeholder="enter email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneInput" className="form-label mt-4">
            Phone Number Of Person
          </label>
          <input
            type="text"
            className="form-control"
            id="phoneInput"
            name="phone"
            value={userDetails.phone}
            onChange={handleInputChange}
            placeholder="enter number"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="notesInput" className="form-label mt-4">
            Notes
          </label>
          <textarea
            className="form-control"
            id="notesInput"
            name="notes"
            value={userDetails.notes}
            onChange={handleInputChange}
            placeholder="Enter notes here"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="birthdayInput" className="form-label mt-4">
            Birthday
          </label>
          <input
            type="date"
            className="form-control"
            id="birthdayInput"
            name="birthday"
            value={userDetails.birthday}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tagsInput" className="form-label mt-4">
            Tags (comma separated)
          </label>
          <input
            type="text"
            className="form-control"
            id="tagsInput"
            name="tags"
            value={userDetails.tags}
            onChange={handleInputChange}
            placeholder="Friend, Work, Family"
          />
        </div>
        <div className="form-group form-check mt-4">
          <input
            type="checkbox"
            className="form-check-input"
            id="favoriteInput"
            name="favorite"
            checked={userDetails.favorite}
            onChange={handleInputChange}
          />
          <label className="form-check-label" htmlFor="favoriteInput">
            Mark as Favorite
          </label>
        </div>
        <button type="submit" className="btn btn-info my-2">
          Add Contact
        </button>
      </form>
    </>
  );
};

export default CreateContact;
