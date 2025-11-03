document.addEventListener("DOMContentLoaded", () => {


    // ====== GLOBALS & INITIAL SETUP ======
    const modal = document.getElementById("snippetFormModal");
    const newBtn = document.getElementById("btn");
    const closeBtn = document.getElementById("cancelSnippetBtn");
    const editModal = document.getElementById("editSnippetModal");

    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = "/login.html"; // redirect if no user
    }

    // ====== MODAL OPEN/CLOSE ======
    newBtn.addEventListener("click", () => modal.style.display = "flex");
    closeBtn.addEventListener("click", () => modal.style.display = "none");

    document.getElementById("deleteSnippetBtn").addEventListener("click", () => {
        editModal.style.display = "none";
    });

    document.getElementById("Logout-btn").addEventListener("click", () => {
        localStorage.removeItem("userId");
        window.location.href = "/login.html";
    });


    // ====== FETCH & DISPLAY SNIPPETS ======
    async function fetchSnippets() {
        try {
            const res = await fetch(`/snippets?userId=${encodeURIComponent(userId)}`);
            if (!res.ok) throw new Error("Failed to fetch snippets");
            const snippets = await res.json();
            displaySnippets(snippets);
        } catch (err) {
            console.error("Error fetching snippets:", err);
        }
    }

    function displaySnippets(snippets) {
        const container = document.querySelector(".snippetContainer");
        container.innerHTML = "";

        if (snippets.length === 0) {
            container.innerHTML = "<p>No snippets yet?? create one now!</p>";
            return;
        }

        snippets.forEach(snippet => {
            const card = document.createElement("div");
            card.className = "card";
            card.dataset.id = snippet._id;
            card.dataset.language = snippet.language;
            card.dataset.tags = snippet.tags.join(", ");
            card.dataset.code = snippet.code;

            card.innerHTML = `
            <div class="cardHead">
            <h3>${snippet.title}</h3>
            <div class="card-actions">
            <img src="icons/edit.png" alt="Edit" class="action-icon edit-btn" data-id="${snippet._id}">
            <img src="icons/delete.png" alt="Delete" class="action-icon delete-btn" data-id="${snippet._id}">
            </div>
            </div>
            <p>${snippet.language}</p>
            <p>Date-Created: ${new Date(snippet.createdAt).toLocaleDateString()}</p>
            `;
            container.appendChild(card);
        });

        attachCardListeners(); // add click listeners to newly created cards
    }

    // ====== CARD LISTENERS ======
    function attachCardListeners() {
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", () => {
                const id = card.dataset.id;
                editModal.dataset.id = id;

                // Fill modal fields with snippet data
                document.getElementById("editTitle").value = card.querySelector("h3").textContent;
                document.getElementById("editLanguage").value = card.dataset.language;
                document.getElementById("editCode").value = card.dataset.code;
                document.getElementById("editTags").value = card.dataset.tags;

                editModal.style.display = "flex";
            });
        });

        // edit & delete buttons
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation(); // prevent card click
                const card = btn.closest(".card");
                card.click(); // reuse card click to open modal
            });
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const snippetId = btn.dataset.id;
                if (!confirm("Delete this snippet?")) return;

                try {
                    const res = await fetch(`/snippets/${snippetId}?userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
                    const data = await res.json();
                    alert(data.message);
                    if (res.ok) fetchSnippets();
                } catch (err) {
                    console.error(err);
                }
            });
        });
    }

    // ====== CREATE SNIPPET ======
    document.getElementById("saveSnippetBtn").addEventListener("click", async () => {
        const title = document.getElementById("snippetTitle").value.trim();
        const language = document.getElementById("snippetLanguage").value;
        const code = document.getElementById("snippetCode").value.trim();
        const tags = document.getElementById("snippetTags")?.value.trim() || "";

        if (!title || !language || !code) {
            alert("Please fill title, language and code.");
            return;
        }

        try {
            const res = await fetch("/snippets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, language, code, tags, userId })
            });

            const data = await res.json();
            alert(data.message);
            if (res.ok) {
                modal.style.display = "none";
                fetchSnippets();
            }
        } catch (err) {
            console.error(err);
        }
    });


    // ====== UPDATE SNIPPET ======
    document.getElementById("updateSnippetBtn").addEventListener("click", async () => {
        const snippetId = editModal.dataset.id;
        const title = document.getElementById("editTitle").value.trim();
        const language = document.getElementById("editLanguage").value;
        const code = document.getElementById("editCode").value.trim();
        const tags = document.getElementById("editTags").value.trim();

        try {
            const res = await fetch(`/snippets/${snippetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, language, code, tags, userId })
            });

            const data = await res.json();
            alert(data.message);
            if (res.ok) {
                editModal.style.display = "none";
                fetchSnippets();
            }
        } catch (err) {
            console.error(err);
        }
    });

    // ====== DELETE (from edit modal) ======
    document.getElementById("deleteSnippetBtn").addEventListener("click", async () => {
        const snippetId = editModal.dataset.id;
        if (!confirm("Delete this snippet?")) return;

        console.log("Frontend delete ID:", editModal.dataset.id, "userId:", userId);

        try {
            const res = await fetch(`http://localhost:5000/snippets/${snippetId}?userId=${encodeURIComponent(userId)}`, { method: "DELETE" })



            const data = await res.json();
            alert(data.message);
            if (res.ok) {
                editModal.style.display = "none";
                fetchSnippets();
            }
        } catch (err) {
            console.error(err);
        }
    });

    // ====== INITIAL CALL ======
    fetchSnippets();

});