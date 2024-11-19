import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import AuthContext from "../context/AuthContext";
import ToastContext from "../context/ToastContext";

const EditContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
    },
    notes: "",
    birthday: "",
    tags: "",
    favorite: false,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setUserDetails((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setUserDetails({ ...userDetails, [name]: value });
    }
  };

  const handleCheckboxChange = () => {
    setUserDetails((prev) => ({
      ...prev,
      favorite: !prev.favorite,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const res = await fetch(`http://localhost:8000/api/contact`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id, ...userDetails }),
    });
    const result = await res.json();
    if (!result.error) {
      toast.success(`Updated [${userDetails.name}] contact`);
      navigate("/mycontacts");
    } else {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/contact/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await res.json();
        setUserDetails({
          name: result.name,
          email: result.email,
          phone: result.phone,
          address: result.address || {
            street: "",
            city: "",
            state: "",
            postalCode: "",
          },
          notes: result.notes || "",
          birthday: result.birthday || "",
          tags: result.tags ? result.tags.join(", ") : "",
          favorite: result.favorite || false,
        });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  return (
    <>
      {loading ? (
        <Spinner splash="Loading Contact..." />
      ) : (
        <>
          <h2>Edit your contact</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nameInput" className="form-label mt-4">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="nameInput"
                name="name"
                value={userDetails.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="emailInput" className="form-label mt-4">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="emailInput"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneInput" className="form-label mt-4">
                Phone
              </label>
              <input
                type="text"
                className="form-control"
                id="phoneInput"
                name="phone"
                value={userDetails.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label mt-4">Address</label>
              <input
                type="text"
                className="form-control"
                name="address.street"
                value={userDetails.address.street}
                onChange={handleInputChange}
                placeholder="Street"
              />
              <input
                type="text"
                className="form-control mt-2"
                name="address.city"
                value={userDetails.address.city}
                onChange={handleInputChange}
                placeholder="City"
              />
              <input
                type="text"
                className="form-control mt-2"
                name="address.state"
                value={userDetails.address.state}
                onChange={handleInputChange}
                placeholder="State"
              />
              <input
                type="text"
                className="form-control mt-2"
                name="address.postalCode"
                value={userDetails.address.postalCode}
                onChange={handleInputChange}
                placeholder="Postal Code"
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
              />
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
                Tags
              </label>
              <input
                type="text"
                className="form-control"
                id="tagsInput"
                name="tags"
                value={userDetails.tags}
                onChange={handleInputChange}
                placeholder="Comma-separated tags"
              />
            </div>
            <div className="form-group mt-4">
              <label>
                <input
                  type="checkbox"
                  checked={userDetails.favorite}
                  onChange={handleCheckboxChange}
                />
                Favorite
              </label>
            </div>
            <button type="submit" className="btn btn-info my-2">
              Save Changes
            </button>
          </form>
        </>
      )}
    </>
  );
};

export default EditContact;
