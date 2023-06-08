const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');


//ROUTE 1 : Get all the notes using: GET "/api/auth/createuser". Login required.
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes)
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");

  }
})

//ROUTE 2 : Add new notes using: POST "/api/auth/addnote". Login required.
router.post('/addnote', fetchuser, [
  body('title', 'Enter a valid title').isLength({ min: 3 }),
  body('description', 'Description must be atleast 5 characters.').isLength({ min: 5 }),
], async (req, res) => {

  try {
    const { title, description, tag } = req.body;
    //If there are errors.return bad request and errors.
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const note = new Notes({
      title, description, tag, user: req.user.id
    })

    const savedNotes = await note.save();
    res.json(savedNotes)

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }

})


//ROUTE 3 : Update an existing notes using: PUT "/api/auth/updatenote". Login required.
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    //create a newNote object
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };

    //Find a note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) { return res.status(404).send("Not Found") }

    if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed") }

    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
    res.json({ note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }

})

//ROUTE 4 : Delete an existing notes using: DELETE "/api/auth/deletenote". Login required.
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
    //Find a note to be delete and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) { return res.status(404).send("Not Found") }

    //Allow deletion only if user owns this note 
    if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed") }

    note = await Notes.findByIdAndDelete(req.params.id)
    res.json({ "Success": "Note has been deleted.", note: note });

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
})
module.exports = router