document.addEventListener("DOMContentLoaded", () => {
    const addLearnListBtn = document.getElementById("addLearnListBtn");
    const learnListModal = document.getElementById("learnListModal");
    const closeModal = learnListModal.querySelector(".close");
    const form = document.getElementById("learnListForm");
    const tbody = document.querySelector("#learn-list-table tbody");
    const categorySelect = document.getElementById("category_id");
    const token = localStorage.getItem("token");
    let isEdit = false;
    let editId = null;
  
    fetch('/public/config.json')
      .then(response => response.json())
      .then(config => {
        const baseUrl = config.API_BASE_URL;
        const imageUrl = config.API_IMAGE_URL;
  
        addLearnListBtn.addEventListener("click", () => {
          form.reset();
          isEdit = false;
          loadCategories();
          learnListModal.classList.remove("hidden");
        });
  
        closeModal.addEventListener("click", () => {
          learnListModal.classList.add("hidden");
        });
  
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(form);
  
          try {
            const url = isEdit
              ? `${baseUrl}/learn_list/${editId}`
              : `${baseUrl}/learn_list`;
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
                  ? "Pembelajaran berhasil diperbarui!"
                  : "Pembelajaran berhasil ditambahkan!"
              );
              fetchLearnLists();
              learnListModal.classList.add("hidden");
            } else {
              alert(data.msg);
            }
          } catch (error) {
            console.error("Error saving learn list:", error);
          }
        });
  
        async function fetchLearnLists() {
          try {
            const response = await fetch(`${baseUrl}/learn_list`, {
              headers: {
                "Authorization": token,
              },
            });
            const data = await response.json();
  
            tbody.innerHTML = "";
            data.result.forEach((item, index) => {
              const row = `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.title}</td>
                  <td>${item.desc}</td>
                  <td>${item.LearnCategory.category_name}</td>
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
            console.error("Error fetching learn lists:", error);
          }
        }
  
        async function handleEdit(e, data) {
          const id = e.target.dataset.id;
          const learnList = data.find((item) => item.id == id);
          loadCategories();
  
          if (learnList) {
            isEdit = true;
            editId = id;
            document.getElementById("title").value = learnList.title;
            document.getElementById("category_id").value = learnList.category_id;
            learnListModal.classList.remove("hidden");
          }
        }
  
        async function handleDelete(e) {
          const id = e.target.dataset.id;
  
          if (confirm("Apakah Anda yakin ingin menghapus pembelajaran ini?")) {
            try {
              const response = await fetch(`${baseUrl}/learn_list/${id}`, {
                method: "DELETE",
                headers: {
                  "Authorization": token,
                },
              });
              const data = await response.json();
              if (data.status === 200) {
                alert("Pembelajaran berhasil dihapus!");
                fetchLearnLists();
              } else {
                alert(data.msg);
              }
            } catch (error) {
              console.error("Error deleting learn list:", error);
            }
          }
        }
  
        async function loadCategories() {
          try {
            const response = await fetch(`${baseUrl}/learn_category`, {
              headers: {
                "Authorization": token,
              },
            });
            const data = await response.json();
            categorySelect.innerHTML = "";
            if (data.result && data.result.length > 0) {
              data.result.forEach((category) => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.category_name;
                categorySelect.appendChild(option);
              });
            } else {
              const option = document.createElement("option");
              option.textContent = "Tidak ada kategori tersedia";
              option.disabled = true;
              categorySelect.appendChild(option);
            }
          } catch (error) {
            console.error("Error loading categories:", error);
          }
        }
  
        fetchLearnLists();
      });
  });
  