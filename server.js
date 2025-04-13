const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const dataFilePath = path.join(__dirname, 'data.json');
const groupsFilePath = path.join(__dirname, 'groups.json');

// Helper: read JSON file
function readJSON(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(err);
    try {
      const parsed = JSON.parse(data);
      callback(null, parsed);
    } catch (e) {
      callback(e);
    }
  });
}

// Helper: write JSON file
function writeJSON(filePath, jsonData, callback) {
  fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), callback);
}

// ----------- Thoughts Endpoints ----------- //

// GET: Retrieve all thoughts.
app.get('/api/thoughts', (req, res) => {
  readJSON(dataFilePath, (err, thoughts) => {
    if (err) return res.status(500).send("Unable to read data file");
    res.json(thoughts);
  });
});

// POST: Add a new thought.
app.post('/api/thoughts', (req, res) => {
  const newThought = req.body;  // expected: text, date, tags, chainId, groupIds
  readJSON(dataFilePath, (err, thoughts) => {
    if (err) return res.status(500).send("Unable to read data file");
    // Generate sequential ID:
    let maxId = thoughts.reduce((max, thought) => {
      const idNum = parseInt(thought.id, 10);
      return idNum > max ? idNum : max;
    }, 0);
    newThought.id = (maxId + 1).toString();
    thoughts.push(newThought);
    writeJSON(dataFilePath, thoughts, (err) => {
      if (err) return res.status(500).send("Unable to update data file");
      res.json(newThought);
    });
  });
});

// PUT: Update an existing thought by its ID.
app.put('/api/thoughts/:id', (req, res) => {
  const thoughtId = req.params.id;
  const updatedThought = req.body;
  readJSON(dataFilePath, (err, thoughts) => {
    if (err) return res.status(500).send("Unable to read data file");
    const index = thoughts.findIndex(thought => thought.id === thoughtId);
    if (index === -1) return res.status(404).send("Thought not found");
    thoughts[index] = updatedThought;
    writeJSON(dataFilePath, thoughts, (err) => {
      if (err) return res.status(500).send("Unable to update data file");
      res.json(updatedThought);
    });
  });
});

// ----------- Groups Endpoints ----------- //

// GET: Retrieve all groups.
app.get('/api/groups', (req, res) => {
  readJSON(groupsFilePath, (err, groups) => {
    if (err) return res.status(500).send("Unable to read groups file");
    res.json(groups);
  });
});

// POST: Add a new group.
app.post('/api/groups', (req, res) => {
  const newGroup = req.body;  // expected: name, description (optional)
  readJSON(groupsFilePath, (err, groups) => {
    if (err) return res.status(500).send("Unable to read groups file");
    // For simplicity, generate an ID like "G1", "G2", etc.
    let maxNum = groups.reduce((max, group) => {
      const num = parseInt(group.id.replace('G', ''), 10);
      return num > max ? num : max;
    }, 0);
    newGroup.id = 'G' + (maxNum + 1);
    groups.push(newGroup);
    writeJSON(groupsFilePath, groups, (err) => {
      if (err) return res.status(500).send("Unable to update groups file");
      res.json(newGroup);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
