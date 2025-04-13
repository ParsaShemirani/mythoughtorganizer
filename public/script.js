document.addEventListener("DOMContentLoaded", function() {
  let thoughts = [];
  let filteredThoughts = [];
  
  // Load thoughts from the API.
  function loadThoughts() {
    fetch('/api/thoughts')
      .then(res => res.json())
      .then(data => {
        thoughts = data;
        filteredThoughts = data;
        applyFilters();
      })
      .catch(err => console.error("Error loading thoughts:", err));
  }
  
  // Render thoughts.
  function renderThoughts(list) {
    const container = document.getElementById("thoughtsList");
    container.innerHTML = "";
    list.forEach(thought => {
      const thoughtDiv = document.createElement("div");
      thoughtDiv.className = "thought";
      thoughtDiv.dataset.id = thought.id;
      
      const textDiv = document.createElement("div");
      textDiv.className = "text";
      textDiv.textContent = thought.text;
      
      const dateDiv = document.createElement("div");
      dateDiv.className = "info";
      dateDiv.textContent = `Date: ${thought.date}`;
      
      const tagsDiv = document.createElement("div");
      tagsDiv.className = "tags";
      thought.tags.forEach(tag => {
        const tagSpan = document.createElement("span");
        tagSpan.textContent = tag;
        tagsDiv.appendChild(tagSpan);
      });
      
      // Display groups if any.
      const groupsDiv = document.createElement("div");
      groupsDiv.className = "groups";
      if (thought.groupIds && thought.groupIds.length > 0) {
        thought.groupIds.forEach(groupId => {
          const groupSpan = document.createElement("span");
          groupSpan.textContent = groupId;
          groupsDiv.appendChild(groupSpan);
        });
      }
      
      // Edit button.
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.className = "edit";
      editButton.addEventListener("click", () => {
        enterEditMode(thoughtDiv, thought);
      });
      
      thoughtDiv.appendChild(textDiv);
      thoughtDiv.appendChild(dateDiv);
      thoughtDiv.appendChild(tagsDiv);
      thoughtDiv.appendChild(groupsDiv);
      thoughtDiv.appendChild(editButton);
      
      // If this thought is a chain starter (chainId empty) and has any replies, show a link to view chain.
      if ((!thought.chainId || thought.chainId === "") && hasReplies(thought.id)) {
        const chainLink = document.createElement("a");
        chainLink.href = `chain.html?rootId=${thought.id}`;
        chainLink.target = "_blank";
        chainLink.textContent = "Click to view chain";
        chainLink.className = "chainLink";
        thoughtDiv.appendChild(chainLink);
      }
      
      container.appendChild(thoughtDiv);
    });
  }
  
  // Check if a thought has any replies (i.e., any thought with chainId equal to this thought's id).
  function hasReplies(rootId) {
    return thoughts.some(thought => thought.chainId === rootId);
  }
  
  // Inline editing.
  function enterEditMode(thoughtDiv, thought) {
    thoughtDiv.innerHTML = "";
    
    const textInput = document.createElement("textarea");
    textInput.value = thought.text;
    
    const tagsInput = document.createElement("input");
    tagsInput.type = "text";
    tagsInput.value = thought.tags.join(', ');
    
    const groupsInput = document.createElement("input");
    groupsInput.type = "text";
    groupsInput.value = thought.groupIds ? thought.groupIds.join(', ') : "";
    
    const chainInput = document.createElement("input");
    chainInput.type = "text";
    chainInput.placeholder = "Chain ID (if any)";
    chainInput.value = thought.chainId || "";
    
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => {
      const updatedThought = {
        ...thought,
        text: textInput.value,
        tags: tagsInput.value.split(',').map(t => t.trim()).filter(t => t),
        groupIds: groupsInput.value.split(',').map(g => g.trim()).filter(g => g),
        chainId: chainInput.value.trim()
      };
      updateThought(updatedThought);
    });
    
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => {
      renderThoughts(filteredThoughts);
    });
    
    thoughtDiv.appendChild(textInput);
    thoughtDiv.appendChild(tagsInput);
    thoughtDiv.appendChild(groupsInput);
    thoughtDiv.appendChild(chainInput);
    thoughtDiv.appendChild(saveButton);
    thoughtDiv.appendChild(cancelButton);
  }
  
  // Send an update to the backend.
  function updateThought(updatedThought) {
    fetch(`/api/thoughts/${updatedThought.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedThought)
    })
    .then(() => loadThoughts())
    .catch(err => console.error("Error updating thought:", err));
  }
  
  // Filtering and sorting.
  function applyFilters() {
    const textQuery = document.getElementById("textSearch").value.trim().toLowerCase();
    const tagQuery = document.getElementById("tagSearch").value.trim().toLowerCase();
    const groupQuery = document.getElementById("groupSearch").value.trim().toLowerCase();
    
    let filterTags = tagQuery ? tagQuery.split(',').map(t => t.trim()).filter(t => t) : [];
    let filterGroups = groupQuery ? groupQuery.split(',').map(g => g.trim()).filter(g => g) : [];
    
    filteredThoughts = thoughts.filter(thought => {
      const textMatches = thought.text.toLowerCase().includes(textQuery);
      const tagsMatches = filterTags.every(tag =>
        thought.tags.map(t => t.toLowerCase()).includes(tag)
      );
      const groupsMatches = filterGroups.every(groupId =>
        thought.groupIds && thought.groupIds.map(g => g.toLowerCase()).includes(groupId)
      );
      return textMatches && tagsMatches && groupsMatches;
    });
    
    applySorting();
    renderThoughts(filteredThoughts);
  }
  
  function applySorting() {
    const sortOption = document.getElementById("dateSort").value;
    if(sortOption !== "none") {
      filteredThoughts.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOption === "asc" ? dateA - dateB : dateB - dateA;
      });
    }
  }
  
  document.getElementById("textSearch").addEventListener("input", applyFilters);
  document.getElementById("tagSearch").addEventListener("input", applyFilters);
  document.getElementById("groupSearch").addEventListener("input", applyFilters);
  document.getElementById("dateSort").addEventListener("change", () => {
    applySorting();
    renderThoughts(filteredThoughts);
  });
  
  loadThoughts();
});
