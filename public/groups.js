document.addEventListener("DOMContentLoaded", function() {
  function loadGroups() {
    fetch('/api/groups')
      .then(res => res.json())
      .then(groups => renderGroups(groups))
      .catch(err => console.error("Error loading groups:", err));
  }
  
  function renderGroups(groups) {
    const container = document.getElementById("groupsList");
    container.innerHTML = "";
    groups.forEach(group => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "groupEntry";
      groupDiv.innerHTML = `<strong>${group.name}</strong> (ID: ${group.id})<br>${group.description || ''}`;
      container.appendChild(groupDiv);
    });
  }
  
  loadGroups();
});
