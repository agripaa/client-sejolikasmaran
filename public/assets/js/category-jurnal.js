document.addEventListener("DOMContentLoaded", () => {
  const uploadCategoryBtn = document.getElementById("uploadCategoryBtn");
  const uploadCategoryModal = document.getElementById("uploadCategoryModal");
  const closeModal = uploadCategoryModal.querySelector(".close");
  const form = document.getElementById("uploadCategoryForm");
  const tbody = document.querySelector("#category-table tbody");
  const trimesterSelect = document.getElementById("trimester_id");
  const token = localStorage.getItem("token");
  let isEdit = false;
  let editId = null;

  fetch("/public/config.json")
    .then((response) => response.json())
    .then((config) => {
      const baseUrl = config.API_BASE_URL;

      uploadCategoryBtn.addEventListener("click", () => {
        form.reset();
        isEdit = false;
        loadTrimesters();
        uploadCategoryModal.classList.remove("hidden");
      });

      closeModal.addEventListener("click", () => {
        uploadCategoryModal.classList.add("hidden");
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData);

        try {
          const url = isEdit
            ? `${baseUrl}/journal/${editId}`
            : `${baseUrl}/journal`;
          const method = isEdit ? "PATCH" : "POST";

          const response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (data.status === 201 || data.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Berhasil!",
              text: isEdit
                ? "Category berhasil diperbarui!"
                : "Category berhasil ditambahkan!",
              timer: 2000,
              showConfirmButton: false,
            });
            fetchCategories();
            uploadCategoryModal.classList.add("hidden");
          } else {
            Swal.fire("Gagal!", data.msg, "error");
          }
        } catch (error) {
          console.error("Error saving category:", error);
        }
      });

      async function fetchCategories() {
        try {
          const response = await fetch(`${baseUrl}/journal`, {
            headers: {
              Authorization: token,
            },
          });
          const data = await response.json();

          console.log({data})

          tbody.innerHTML = "";
          data.result.forEach((item, index) => {
            const row = `
              <tr>
                <td>${index + 1}</td>
                <td>${item.category_jurnal}</td>
                <td>${item.CategoryJournal ? item.CategoryJournal.cat_name : "-"}</td>
                <td>${item.born_date ? item.born_date : "-"}</td>
                <td>${item.Trimester ? item.Trimester.cat_trimester : "Tidak Tersedia"}</td>
                <td>
                  <button class="btn btn-edit" data-id="${item.id}">Edit</button>
                  <button class="btn btn-danger" data-id="${item.id}">Delete</button>
                </td>
              </tr>
            `;
            tbody.innerHTML += row;
          });

          const editButtons = document.querySelectorAll(".btn-edit");
          const deleteButtons = document.querySelectorAll(".btn-danger");

          editButtons.forEach((button) =>
            button.addEventListener("click", (e) => handleEdit(e, data.result))
          );

          deleteButtons.forEach((button) =>
            button.addEventListener("click", (e) => handleDelete(e))
          );
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      }

      async function handleEdit(e, data) {
        const id = e.target.dataset.id;
        const category = data.find((item) => item.id == id);
        loadTrimesters();

        if (category) {
          isEdit = true;
          editId = id;
          document.getElementById("category_jurnal").value = category.category_jurnal;
          document.getElementById("trimester_id").value = category.trimester_id;
          uploadCategoryModal.classList.remove("hidden");
        }
      }

      async function handleDelete(e) {
        const id = e.target.dataset.id;

        const result = await Swal.fire({
          title: "Hapus Kategori?",
          text: "Anda yakin ingin menghapus kategori ini?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hapus",
          cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
          try {
            const response = await fetch(`${baseUrl}/journal/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: token,
              },
            });

            const data = await response.json();
            if (data.status === 200) {
              Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Kategori berhasil dihapus.",
                timer: 2000,
                showConfirmButton: false,
              });
              fetchCategories();
            } else {
              Swal.fire("Gagal!", data.msg, "error");
            }
          } catch (error) {
            console.error("Error deleting category:", error);
          }
        }
      }

      async function loadTrimesters() {
        try {
          const response = await fetch(`${baseUrl}/trimester`, {
            headers: {
              Authorization: token,
            },
          });
          const data = await response.json();

          trimesterSelect.innerHTML = "";  
          if (data.result && data.result.length > 0) {
            data.result.forEach((trimester) => {
              const option = document.createElement("option");
              option.value = trimester.id;
              option.textContent = trimester.cat_trimester;
              trimesterSelect.appendChild(option);
            });
          } else {
            Swal.fire("Gagal!", "Tidak ada data trimester yang ditemukan.", "error");
          }
        } catch (error) {
          console.error("Error loading trimesters:", error);
        }
      }

      fetchCategories();
    });
});
