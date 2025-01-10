document.addEventListener("DOMContentLoaded", () => {
    const addDetailBtn = document.getElementById("addDetailBtn");
    const detailModal = document.getElementById("detailModal");
    const closeModal = detailModal.querySelector(".close");
    const form = document.getElementById("detailForm");
    const fileContainer = document.getElementById("file-container");
    const tbody = document.querySelector("#detail-table tbody");
    const listClassSelect = document.getElementById("list_class_id");
    const token = localStorage.getItem("token");
    let isEdit = false;
    let editId = null;
  
    fetch('/public/config.json')
      .then(response => response.json())
      .then(config => {
        const baseUrl = config.API_BASE_URL;
        const imageUrl = config.API_IMAGE_URL;
  
        addDetailBtn.addEventListener("click", () => {
          form.reset();
          isEdit = false;
          loadClasses();
          detailModal.classList.remove("hidden");
        });
  
        closeModal.addEventListener("click", () => {
          detailModal.classList.add("hidden");
        });
  
        document.getElementById("addFileBtn").addEventListener("click", () => {
          const newFileInput = document.createElement("input");
          newFileInput.type = "file";
          newFileInput.name = "content";
          newFileInput.accept = ".jpg, .jpeg, .png, .mp4, .pdf";
          fileContainer.appendChild(newFileInput);
        });
  
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(form);
  
          try {
            const url = isEdit
              ? `${baseUrl}/detail_class/${editId}`
              : `${baseUrl}/detail_class`;
            const method = isEdit ? "PATCH" : "POST";
  
            const response = await fetch(url, {
              method,
              headers: {
                "Authorization": token,
              },
              body: formData,
            });
  
            const data = await response.json();
            if (data.status === 200 || data.status === 201) {
              alert(isEdit ? "Detail berhasil diperbarui!" : "Detail berhasil ditambahkan!");
              fetchDetails();
              detailModal.classList.add("hidden");
            } else {
              alert(data.msg);
            }
          } catch (error) {
            console.error("Error saving detail:", error);
          }
        });
  
        async function fetchDetails() {
            try {
              const response = await fetch(`${baseUrl}/detail_class`, {
                headers: {
                  "Authorization": token,
                },
              });
          
              const data = await response.json();
          
              tbody.innerHTML = "";
              data.result.forEach((item, index) => {
                const contentFiles = item.Subjects
                  ? item.Subjects.map(
                      (subject) =>
                        `<a href="${imageUrl}${subject.sub_lear_path}" target="_blank">${subject.sub_lear_path.split('/').pop()}</a>`
                    ).join("<br>")
                  : "No content available";
          
                const row = `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.desc}</td>
                    <td>${contentFiles}</td>
                    <td>
                      <button class="edit-btn" data-id="${item.id}">Edit</button>
                      <button class="delete-btn" data-id="${item.id}">Delete</button>
                    </td>
                  </tr>
                `;
                tbody.innerHTML += row;
              });
          
              const editButtons = document.querySelectorAll(".edit-btn");
              const deleteButtons = document.querySelectorAll(".delete-btn");
          
              editButtons.forEach((button) =>
                button.addEventListener("click", (e) => handleEdit(e, data.result))
              );
          
              deleteButtons.forEach((button) =>
                button.addEventListener("click", (e) => handleDelete(e))
              );
            } catch (error) {
              console.error("Error fetching details:", error);
            }
          }
          
  
          async function handleEdit(e, data) {
            const id = e.target.dataset.id;
            const detailClass = data.find((item) => item.id == id);
        
            if (detailClass) {
                isEdit = true;
                editId = id;
        
                // Populate form fields
                document.getElementById("desc").value = detailClass.desc;
        
                // Disable dropdown and add hidden input
                const listClassSelect = document.getElementById("list_class_id");
                listClassSelect.innerHTML = ""; // Clear existing options
                const selectedOption = document.createElement("option");
                selectedOption.value = detailClass.list_class_id;
                selectedOption.textContent = detailClass.ListClass.title;
                listClassSelect.appendChild(selectedOption);
                listClassSelect.disabled = true;
        
                const hiddenInput = document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.name = "list_class_id";
                hiddenInput.value = detailClass.list_class_id;
                form.appendChild(hiddenInput);
        
                detailModal.classList.remove("hidden");
            }
        }
        
        
        
  
        async function handleDelete(e) {
          const id = e.target.dataset.id;
  
          if (confirm("Apakah Anda yakin ingin menghapus detail ini?")) {
            try {
              const response = await fetch(`${baseUrl}/detail_class/${id}`, {
                method: "DELETE",
                headers: {
                  "Authorization": token,
                },
              });
              const data = await response.json();
              if (data.status === 200) {
                alert("Detail berhasil dihapus!");
                fetchDetails();
              } else {
                alert(data.msg);
              }
            } catch (error) {
              console.error("Error deleting detail:", error);
            }
          }
        }
  
        async function loadClasses() {
            try {
                const response = await fetch(`${baseUrl}/list_class/available`, {
                    headers: {
                        Authorization: token,
                    },
                });
                const data = await response.json();
                listClassSelect.innerHTML = "";
        
                if (data.result && data.result.length > 0) {
                    data.result.forEach((list) => {
                        const option = document.createElement("option");
                        option.value = list.id;
                        option.textContent = list.title;
                        listClassSelect.appendChild(option);
                    });
                } else {
                    const option = document.createElement("option");
                    option.textContent = "Semua kelas sudah memiliki detail";
                    option.disabled = true;
                    listClassSelect.appendChild(option);
                }
            } catch (error) {
                console.error("Error loading classes:", error);
            }
        }
        
  
        fetchDetails();
      });
  });
  