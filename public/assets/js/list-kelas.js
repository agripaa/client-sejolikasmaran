document.addEventListener("DOMContentLoaded", () => {
    const addClassBtn = document.getElementById("addClassBtn");
    const classModal = document.getElementById("classModal");
    const closeModal = classModal.querySelector(".close");
    const form = document.getElementById("classForm");
    const tbody = document.querySelector("#class-table tbody");
    const learnListSelect = document.getElementById("learn_list_id");
    const token = localStorage.getItem("token");
    let isEdit = false;
    let editId = null;
  
    fetch('/public/config.json')
      .then(response => response.json())
      .then(config => {
        const baseUrl = config.API_BASE_URL;
        const imageUrl = config.API_IMAGE_URL;
  
        addClassBtn.addEventListener("click", () => {
          form.reset();
          isEdit = false;
          loadLearnLists();
          classModal.classList.remove("hidden");
        });
  
        closeModal.addEventListener("click", () => {
          classModal.classList.add("hidden");
        });
  
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(form);
  
          try {
            const url = isEdit
              ? `${baseUrl}/list_class/${editId}`
              : `${baseUrl}/list_class`;
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
              alert(
                isEdit
                  ? "Kelas berhasil diperbarui!"
                  : "Kelas berhasil ditambahkan!"
              );
              fetchClasses();
              classModal.classList.add("hidden");
            } else {
              alert(data.msg);
            }
          } catch (error) {
            console.error("Error saving class:", error);
          }
        });
  
        async function fetchClasses() {
          try {
            const response = await fetch(`${baseUrl}/list_class`, {
              headers: {
                "Authorization": token,
              },
            });
            const data = await response.json();
  
            tbody.innerHTML = "";
            data.result.forEach((item) => {
              const row = `
                <tr>
                  <td>${item.id}</td>
                  <td>${item.title}</td>
                  <td>${item.desc}</td>
                  <td>${item.LearnList.title}</td>
                  <td><img src="${imageUrl}${item.img_path}" alt="${item.title}" width="50"></td>
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
            console.error("Error fetching classes:", error);
          }
        }
  
        async function handleEdit(e, data) {
          const id = e.target.dataset.id;
          const listClass = data.find((item) => item.id == id);
          loadLearnLists();
  
          if (listClass) {
            isEdit = true;
            editId = id;
            document.getElementById("title").value = listClass.title;
            document.getElementById("learn_list_id").value = listClass.learn_list_id;
            classModal.classList.remove("hidden");
          }
        }
  
        async function handleDelete(e) {
          const id = e.target.dataset.id;
  
          if (confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
            try {
              const response = await fetch(`${baseUrl}/list_class/${id}`, {
                method: "DELETE",
                headers: {
                  "Authorization": token,
                },
              });
              const data = await response.json();
              if (data.status === 200) {
                alert("Kelas berhasil dihapus!");
                fetchClasses();
              } else {
                alert(data.msg);
              }
            } catch (error) {
              console.error("Error deleting class:", error);
            }
          }
        }
  
        async function loadLearnLists() {
          try {
            const response = await fetch(`${baseUrl}/learn_list`, {
              headers: {
                "Authorization": token,
              },
            });
            const data = await response.json();
            learnListSelect.innerHTML = "";
            if (data.result && data.result.length > 0) {
              data.result.forEach((list) => {
                const option = document.createElement("option");
                option.value = list.id;
                option.textContent = list.title;
                learnListSelect.appendChild(option);
              });
            } else {
              const option = document.createElement("option");
              option.textContent = "Tidak ada kategori tersedia";
              option.disabled = true;
              learnListSelect.appendChild(option);
            }
          } catch (error) {
            console.error("Error loading learn lists:", error);
          }
        }
  
        fetchClasses();
      });
  });
  