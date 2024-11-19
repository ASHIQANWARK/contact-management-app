const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { validateContact, Contact } = require("../models/Contact");
const mongoose = require("mongoose");

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Create a new contact
 *     description: Allows the logged-in user to create a new contact.
 *     tags: [Contacts]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               notes:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               favorite:
 *                 type: boolean
 *             required:
 *               - name
 *               - email
 *     responses:
 *       201:
 *         description: Contact created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/contact", auth, async (req, res) => {
  const { error } = validateContact(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, address, email, phone, notes, birthday, tags, favorite } = req.body;

  try {
    const newContact = new Contact({
      name,
      address,
      email,
      phone,
      notes,
      birthday,
      tags,
      favorite,
      postedBy: req.user._id,
    });

    const result = await newContact.save();
    return res.status(201).json({ ...result._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server Error" });
  }
});

/**
 * @swagger
 * /api/mycontacts:
 *   get:
 *     summary: Fetch all contacts of the logged-in user
 *     description: Retrieves a list of all contacts for the logged-in user.
 *     tags: [Contacts]
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: List of contacts retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/mycontacts", auth, async (req, res) => {
  try {
    const myContacts = await Contact.find({ postedBy: req.user._id }).populate("postedBy", "-password");
    return res.status(200).json({ contacts: myContacts.reverse() });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server Error" });
  }
});

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Fetch a single contact by ID
 *     description: Retrieves a specific contact by ID.
 *     tags: [Contacts]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the contact to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact retrieved successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get("/contact/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "No ID specified." });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Please enter a valid ID" });

  try {
    const contact = await Contact.findOne({ _id: id, postedBy: req.user._id });

    if (!contact) return res.status(404).json({ error: "Contact not found" });
    return res.status(200).json({ ...contact._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server Error" });
  }
});

/**
 * @swagger
 * /api/contact:
 *   put:
 *     summary: Update an existing contact
 *     description: Allows the logged-in user to update an existing contact.
 *     tags: [Contacts]
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               notes:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               favorite:
 *                 type: boolean
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *       400:
 *         description: Invalid ID or missing fields
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.put("/contact", auth, async (req, res) => {
  const { id, name, address, email, phone, notes, birthday, tags, favorite } = req.body;

  if (!id) return res.status(400).json({ error: "No ID specified." });

  try {
    const contact = await Contact.findOne({ _id: id, postedBy: req.user._id });

    if (!contact) {
      return res.status(404).json({ error: "Contact not found." });
    }

    const updatedContact = {
      name,
      address,
      email,
      phone,
      notes,
      birthday,
      tags,
      favorite
    };

    const result = await Contact.findByIdAndUpdate(id, updatedContact, { new: true });

    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server Error" });
  }
});

/**
 * @swagger
 * /api/contact/{id}:
 *   delete:
 *     summary: Delete a contact
 *     description: Allows the logged-in user to delete a specific contact.
 *     tags: [Contacts]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the contact to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       404:
 *         description: Contact not found
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.delete("/contact/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await Contact.findOneAndDelete({ _id: id, postedBy: req.user._id });

    if (!contact) {
      return res.status(404).json({ error: "Contact not found." });
    }

    return res.status(200).json({ message: "Contact deleted successfully!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server Error" });
  }
});


/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Fetch a single contact by ID
 *     description: Retrieves a specific contact by ID.
 *     tags: [Contacts]
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the contact to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact retrieved successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Contact not found
 *       500:
 *         description: Server error
 */
router.get("/contact/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "No ID specified." });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Please enter a valid ID" });

  try {
    const contact = await Contact.findOne({ _id: id });

    if (!contact) return res.status(404).json({ error: "Contact not found" });
    return res.status(200).json({ ...contact._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
