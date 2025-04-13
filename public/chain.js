document.addEventListener("DOMContentLoaded", function() {
  // Get rootId from query parameter.
  const urlParams = new URLSearchParams(window.location.search);
  const rootId = urlParams.get("rootId");
  if (!rootId) {
    document.getElementById("chainDisplay").textContent = "No rootId provided.";
    return;
  }
  
  // Load all thoughts and then filter for the chain.
  fetch('/api/thoughts')
    .then(res => res.json())
    .then(thoughts => {
      // Find the root thought.
      const rootThought = thoughts.find(t => t.id === rootId);
      if (!rootThought) {
        document.getElementById("chainDisplay").textContent = "Root thought not found.";
        return;
      }
      // Build chain recursively.
      let chain = [];
      function addReplies(parentId) {
        const replies = thoughts.filter(t => t.chainId === parentId);
        replies.forEach(reply => {
          chain.push(reply);
          addReplies(reply.id);
        });
      }
      chain.push(rootThought);
      addReplies(rootId);
      renderChain(chain);
    })
    .catch(err => console.error("Error loading thoughts for chain:", err));
  
  function renderChain(chain) {
    const container = document.getElementById("chainDisplay");
    container.innerHTML = "";
    // Sort chain by date (or maintain insertion order).
    chain.sort((a, b) => new Date(a.date) - new Date(b.date));
    chain.forEach((thought, index) => {
      const thoughtDiv = document.createElement("div");
      thoughtDiv.className = "chainThought";
      thoughtDiv.innerHTML = `<strong>#${thought.id}</strong>: ${thought.text} <br><em>Date:</em> ${thought.date}`;
      container.appendChild(thoughtDiv);
    });
  }
});
