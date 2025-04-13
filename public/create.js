document.addEventListener("DOMContentLoaded", function() {
  // Add new thought.
  document.getElementById("addThoughtBtn").addEventListener("click", function() {
    const text = document.getElementById("newThoughtText").value;
    const tags = document.getElementById("newThoughtTags").value.split(',')
                   .map(t => t.trim()).filter(t => t);
    const groupIds = document.getElementById("newThoughtGroupIds").value.split(',')
                     .map(g => g.trim()).filter(g => g);
    const chainId = document.getElementById("newThoughtChainId").value.trim();
    if (text.trim() === "") {
      alert("Thought text cannot be empty.");
      return;
    }
    const newThought = {
      text,
      date: new Date().toISOString().split('T')[0],
      tags,
      groupIds,
      chainId
    };
    fetch('/api/thoughts', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newThought)
    })
    .then(res => res.json())
    .then(() => {
      alert("New thought added.");
      document.getElementById("newThoughtText").value = "";
      document.getElementById("newThoughtTags").value = "";
      document.getElementById("newThoughtGroupIds").value = "";
      document.getElementById("newThoughtChainId").value = "";
    })
    .catch(err => console.error("Error adding thought:", err));
  });
  
  // Add new group.
  document.getElementById("addGroupBtn").addEventListener("click", function() {
    const name = document.getElementById("newGroupName").value;
    const description = document.getElementById("newGroupDescription").value;
    if (name.trim() === "") {
      alert("Group name cannot be empty.");
      return;
    }
    const newGroup = { name, description };
    fetch('/api/groups', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGroup)
    })
    .then(res => res.json())
    .then(() => {
      alert("New group added.");
      document.getElementById("newGroupName").value = "";
      document.getElementById("newGroupDescription").value = "";
    })
    .catch(err => console.error("Error adding group:", err));
  });
});
