document.addEventListener("DOMContentLoaded", () => {
    const uploadTrimesterBtn = document.getElementById("uploadTrimesterBtn");
    const uploadTrimesterModal = document.getElementById("uploadTrimesterModal");
    const closeModal = uploadTrimesterModal.querySelector(".close");
    const form = document.getElementById("uploadTrimesterForm");
    const tbody = document.querySelector("#journal-table tbody");
    const token = localStorage.getItem("token");
    let isEdit = false; // Flag untuk cek edit mode
    let editId = null; // ID untuk edit
  
    uploadTrimesterBtn.addEventListener("click", () => {
      form.reset();
      isEdit = false;
      uploadTrimesterModal.classList.remove("hidden");
    });
  
    closeModal.addEventListener("click", () => {
      uploadTrimesterModal.classList.add("hidden");
    });
  
    fetch('/public/config.json')
      .then(response => response.json())
      .then(config => {
        const baseUrl = config.API_BASE_URL;
  
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData);
          
            try {
              const url = isEdit
                ? `${baseUrl}/trimester/${editId}` // Gunakan editId langsung
                : `${baseUrl}/trimester`;
              const method = isEdit ? "PATCH" : "POST";
          
              const response = await fetch(url, {
                method,
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": token,
                },
                body: JSON.stringify(payload),
              });
          
              const data = await response.json();
              if (data.status === 200) {
                alert(
                  isEdit
                    ? "Trimester berhasil diperbarui!"
                    : "Trimester berhasil ditambahkan!"
                );
                fetchTrimester(); // Refresh tabel
                uploadTrimesterModal.classList.add("hidden"); // Tutup modal
              } else {
                alert(data.msg);
              }
            } catch (error) {
              console.error("Error saving trimester:", error);
            }
          });

        async function fetchTrimester() {
          try {
            const response = await fetch(`${baseUrl}/trimester`, {
              headers: {
                "Authorization": token,
              },
            });
            const data = await response.json();
  
            tbody.innerHTML = "";
            data.result.forEach((item, index) => {
              const row = `
                <tr>
                  <td>${item.cat_trimester}</td>
                  <td>${item.desc}</td>
                  <td>${item.baby_desc ? item.baby_desc : "-"}</td>
                  <td>${item.postpartum_desc ? item.postpartum_desc : "-"}</td>
                  <td>
                    <button class="btn btn-edit" data-id="${item.id}">Edit</button>
                    <button class="btn btn-danger" data-id="${item.id}">Delete</button>
                  </td>
                </tr>
              `;
              tbody.innerHTML += row;
            });
  
            // Tambahkan event listener untuk tombol Edit dan Delete
            const editButtons = document.querySelectorAll(".btn-edit");
            const deleteButtons = document.querySelectorAll(".btn-danger");
  
            editButtons.forEach((button) =>
              button.addEventListener("click", (e) => handleEdit(e, data.result))
            );

            deleteButtons.forEach((button) =>
              button.addEventListener("click", (e) => handleDelete(e))
            );
          } catch (error) {
            console.error("Error fetching trimester:", error);
          }
        }
  
        function handleEdit(e, data) {
          const id = e.target.dataset.id;
          const trimester = data.find((item) => item.id == id);
  
          if (trimester) {
            isEdit = true;
            editId = id;
            document.getElementById("cat_trimester").value = trimester.cat_trimester;
            document.getElementById("desc").value = trimester.desc;
            uploadTrimesterModal.classList.remove("hidden");
          }
        }
  
        async function handleDelete(e) {
            const id = e.target.dataset.id;

            if (confirm("Apakah Anda yakin ingin menghapus trimester ini?")) {
                try {
                const response = await fetch(`${baseUrl}/trimester/${id}`, {
                    method: "DELETE",
                    headers: {
                    "Authorization": token,
                    },
                });
                const data = await response.json();
                if (data.status === 200) {
                    alert("Trimester berhasil dihapus!");
                    fetchTrimester();
                } else {
                    alert(data.msg);
                }
                } catch (error) {
                console.error("Error deleting trimester:", error);
                }
            }
        }

  
        fetchTrimester();
      });
  });
  