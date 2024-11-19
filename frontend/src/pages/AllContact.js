import React, { useContext, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import ToastContext from "../context/ToastContext";

const AllContact = () => {
  const { toast } = useContext(ToastContext);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState({});
  const [contacts, setContacts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [originalContacts, setOriginalContacts] = useState([]);
  const [sortField, setSortField] = useState("name"); // Default sort by name
  const [sortOrder, setSortOrder] = useState("asc"); // Default ascending
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage] = useState(5); // Show 5 contacts per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/mycontacts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await res.json();
        if (!result.error) {
          setContacts(result.contacts);
          setOriginalContacts(result.contacts);
        } else {
          toast.error(result.error);
        }
      } catch (err) {
        toast.error("Error fetching contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [toast]);

  const deleteContact = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        const res = await fetch(`http://localhost:8000/api/delete/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await res.json();
        if (!result.error) {
          setContacts(result.myContacts);
          setOriginalContacts(result.myContacts);
          toast.success("Deleted contact");
          setShowModal(false);
        } else {
          toast.error(result.error);
        }
      } catch (err) {
        toast.error("Error deleting contact");
      }
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchInput.trim() === "") {
      toast.info("Search field cannot be empty");
      return;
    }

    const filteredContacts = originalContacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    if (filteredContacts.length === 0) {
      toast.info("No contacts found matching your search");
    }

    setContacts(filteredContacts);
  };

  const clearSearch = () => {
    setContacts(originalContacts);
    setSearchInput("");
  };

  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
    const sortedContacts = [...contacts].sort((a, b) => {
      if (field === "name") {
        return newSortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (field === "birthday") {
        return newSortOrder === "asc" ? new Date(a.birthday) - new Date(b.birthday) : new Date(b.birthday) - new Date(a.birthday);
      }
      return 0;
    });
    setContacts(sortedContacts);
  };

  const handleFavoriteToggle = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/favorite/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await res.json();
      if (!result.error) {
        setContacts(result.contacts);
        setOriginalContacts(result.contacts);
        toast.success("Updated favorite status");
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Error updating favorite status");
    }
  };

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(contacts.length / contactsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div>
        <h1>Your Contacts</h1>
        <a href="/mycontacts" className="btn btn-danger my-2">
          Reload Contacts
        </a>
        <hr className="my-4" />
        {loading ? (
          <Spinner splash="Loading Contacts..." />
        ) : (
          <>
            {contacts.length === 0 ? (
              <h3>No contacts created yet</h3>
            ) : (
              <>
                <form className="d-flex mb-3" onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    name="searchInput"
                    id="searchInput"
                    className="form-control"
                    placeholder="Search Contact"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-info mx-2">
                    Search
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={clearSearch}
                  >
                    Clear
                  </button>
                </form>

                <div className="mb-3">
                  <button onClick={() => handleSort("name")} className="btn btn-info">
                    Sort by Name
                  </button>
                  <button onClick={() => handleSort("birthday")} className="btn btn-info mx-2">
                    Sort by Birthday
                  </button>
                </div>

                <p>
                  Your Total Contacts: <strong>{contacts.length}</strong>
                </p>
                <table className="table table-striped table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Street</th>
                      <th scope="col">State</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                      <th scope="col">Birthday</th>
                      <th scope="col">Tags</th>
                      <th scope="col">Favorite</th>
                      <th scope="col">Posted By</th>
                      <th scope="col">Notes</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentContacts.map((contact, index) => (
                      <tr
                        key={contact._id}
                        className="cursor-pointer"
                        onClick={() => {
                          setModalData(contact);
                          setShowModal(true);
                        }}
                      >
                        <th scope="row">{index + 1}</th>
                        <td>{contact.name}</td>
                        <td>{contact.address ? `${contact.address.street}, ${contact.address.city}` : "N/A"}</td>
                        <td>{contact.address ? contact.address.state : "N/A"}</td>
                        <td>{contact.email}</td>
                        <td>{contact.phone}</td>
                        <td>{contact.birthday ? new Date(contact.birthday).toLocaleDateString() : "N/A"}</td>
                        <td>{contact.tags ? contact.tags.join(", ") : "N/A"}</td>
                        <td>
                          <button
                            className={`btn btn-sm ${contact.favorite ? "btn-warning" : "btn-outline-warning"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(contact._id);
                            }}
                          >
                            {contact.favorite ? "★" : "☆"}
                          </button>
                        </td>
                        <td>{contact.postedBy?.name || "N/A"}</td>
                        <td>{contact.notes || "N/A"}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-info mx-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/edit/${contact._id}`);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger mx-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteContact(contact._id);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="d-flex justify-content-center my-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="btn btn-secondary mx-2"
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="btn btn-secondary mx-2"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalData.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Email:</strong> {modalData.email}
          </p>
          <p>
            <strong>Phone:</strong> {modalData.phone}
          </p>
          <p>
            <strong>Birthday:</strong> {modalData.birthday}
          </p>
          <p>
            <strong>Address:</strong> {modalData.address?.street}, {modalData.address?.city},{" "}
            {modalData.address?.state}
          </p>
          <p>
            <strong>Notes:</strong> {modalData.notes}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-danger" onClick={() => deleteContact(modalData._id)}>
            Delete
          </button>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AllContact;
