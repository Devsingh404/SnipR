let editor;
let editEditor;

document.addEventListener("DOMContentLoaded", () => {

    // ====== MONACO INIT ======
    require.config({
        paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs" }
    });

    require(["vs/editor/editor.main"], function () {

        editor = monaco.editor.create(document.getElementById("editor"), {
            value: "",
            language: "javascript",
            theme: "vs-dark",
            automaticLayout: true
        });

        editEditor = monaco.editor.create(document.getElementById("editEditor"), {
            value: "",
            language: "javascript",
            theme: "vs-dark",
            automaticLayout: true
        });

    });

    // ====== GLOBALS ======
    const modal = document.getElementById("snippetFormModal");
    const newBtn = document.getElementById("btn");
    const closeBtn = document.getElementById("cancelSnippetBtn");
    const editModal = document.getElementById("editSnippetModal");

    const userId = localStorage.getItem("userId");
    if (!userId) {
        window.location.href = "/login.html";
    }

    // ====== MODAL OPEN/CLOSE ======

    newBtn.addEventListener("click", () => {
        modal.style.display = "flex";

        setTimeout(() => {
            if (editor) {
                editor.layout();
                monaco.editor.setModelLanguage(editor.getModel(), "javascript");
            }
        }, 100);
    });

    closeBtn.addEventListener("click", () => modal.style.display = "none");

    document.getElementById("deleteSnippetBtn").addEventListener("click", () => {
        editModal.style.display = "none";
    });

    document.getElementById("Logout-btn").addEventListener("click", () => {
        localStorage.removeItem("userId");
        window.location.href = "/login.html";
    });

    // ====== FETCH ======
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
                    <img src="icons/edit.png" class="action-icon edit-btn" data-id="${snippet._id}">
                    <img src="icons/delete.png" class="action-icon delete-btn" data-id="${snippet._id}">
                </div>
            </div>
            <p>${snippet.language}</p>
            <p>Date-Created: ${new Date(snippet.createdAt).toLocaleDateString()}</p>
            `;

            container.appendChild(card);
        });

        attachCardListeners();
    }

    // ====== CARD LISTENERS ======
    function attachCardListeners() {
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", () => {
                const id = card.dataset.id;
                editModal.dataset.id = id;

                document.getElementById("editTitle").value = card.querySelector("h3").textContent;
                document.getElementById("editLanguage").value = card.dataset.language;
                document.getElementById("editTags").value = card.dataset.tags;

                editModal.style.display = "flex";

                setTimeout(() => {
                    if (editEditor) {
                        editEditor.setValue(card.dataset.code);
                        monaco.editor.setModelLanguage(editEditor.getModel(), card.dataset.language);
                        editEditor.layout();
                    }
                }, 100);
            });
        });

        // edit button
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                btn.closest(".card").click();
            });
        });

        // delete button
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();

                const snippetId = btn.dataset.id;
                if (!confirm("Delete this snippet?")) return;

                try {
                    const res = await fetch(`/snippets/${snippetId}?userId=${encodeURIComponent(userId)}`, {
                        method: "DELETE"
                    });

                    const data = await res.json();
                    alert(data.message);

                    if (res.ok) fetchSnippets();
                } catch (err) {
                    console.error(err);
                }
            });
        });
    }

    // ====== CREATE ======
    document.getElementById("saveSnippetBtn").addEventListener("click", async () => {

        if (!editor) {
            alert("Editor loading...");
            return;
        }

        const title = document.getElementById("snippetTitle").value.trim();
        const language = document.getElementById("snippetLanguage").value;
        const code = editor.getValue().trim();
        const tags = document.getElementById("snippetTags").value.trim();

        if (!title || !language || !code) {
            alert("Fill all fields");
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
                if (editor) editor.setValue("");
                fetchSnippets();
            }
        } catch (err) {
            console.error(err);
        }
    });

    // ====== UPDATE ======
    document.getElementById("updateSnippetBtn").addEventListener("click", async () => {

        if (!editEditor) {
            alert("Editor loading...");
            return;
        }

        const snippetId = editModal.dataset.id;
        const title = document.getElementById("editTitle").value.trim();
        const language = document.getElementById("editLanguage").value;
        const code = editEditor.getValue().trim();
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

    // ====== DELETE (MODAL) ======
    document.getElementById("deleteSnippetBtn").addEventListener("click", async () => {
        const snippetId = editModal.dataset.id;
        if (!confirm("Delete this snippet?")) return;

        try {
            const res = await fetch(`/snippets/${snippetId}?userId=${encodeURIComponent(userId)}`, {
                method: "DELETE"
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

    // ====== LANGUAGE SWITCH ======
    document.getElementById("snippetLanguage").addEventListener("change", function () {
        if (editor) {
            monaco.editor.setModelLanguage(editor.getModel(), this.value);
        }
    });

    document.getElementById("editLanguage").addEventListener("change", function () {
        if (editEditor) {
            monaco.editor.setModelLanguage(editEditor.getModel(), this.value);
        }
    });

    // ====== INIT ======
    fetchSnippets();
});