document.addEventListener("DOMContentLoaded", () => {
  const uploadJournalBtn = document.getElementById("uploadJournalBtn");
  const tbody = document.querySelector("#journal-table tbody");
  const token = localStorage.getItem("token");
  let isEdit = false;
  let editId = null;

  fetch("/public/config.json")
    .then((response) => response.json())
    .then((config) => {
      const baseUrl = config.API_BASE_URL;

      uploadJournalBtn.addEventListener("click", () => {
        isEdit = false;
        showJournalModal(); // Panggil modal SweetAlert2
      });

      async function fetchListJournal() {
        try {
          const response = await fetch(`${baseUrl}/list_journal`, {
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
                <td>${item.journal}</td>
                <td>${item.is_required ? "Ya" : "Tidak"}</td>
                <td>${item.PregnancyJournal?.category_jurnal}</td>
                <td>
                  <button class="btn btn-edit" data-id="${item.id}">Edit</button>
                  <button class="btn btn-danger" data-id="${item.id}">Delete</button>
                </td>
              </tr>
            `;
            tbody.innerHTML += row;
          });

          document.querySelectorAll(".btn-edit").forEach((button) =>
            button.addEventListener("click", (e) => handleEdit(e, data.result))
          );

          document.querySelectorAll(".btn-danger").forEach((button) =>
            button.addEventListener("click", (e) => handleDelete(e))
          );
        } catch (error) {
          console.error("Error fetching list journals:", error);
        }
      }

      async function showJournalModal(data = null) {
        const { value: formValues } = await Swal.fire({
          title: isEdit ? "Edit Jurnal" : "Tambah Jurnal",
          html: `
            <label for="journal">Nama Jurnal:</label>
            <input type="text" id="journal" class="swal2-input" value="${data?.journal || ""}">
            <label for="is_required">Wajib:</label>
            <select id="is_required" class="swal2-select">
              <option value="true" ${data?.is_required === true ? "selected" : ""}>Ya</option>
              <option value="false" ${data?.is_required === false ? "selected" : ""}>Tidak</option>
            </select>
            <label for="pregnancy_journal_id">Kategori Kehamilan:</label>
            <select id="pregnancy_journal_id" class="swal2-select"></select>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Simpan",
          preConfirm: () => {
            const popup = Swal.getPopup();
            const journal = popup.querySelector("#journal");
            const is_required = popup.querySelector("#is_required");
            const pregnancy_journal_id = popup.querySelector("#pregnancy_journal_id");
      
            if (!journal.value.trim()) {
              Swal.showValidationMessage("Nama Jurnal tidak boleh kosong!");
              return false;
            }
      
            return {
              journal: journal.value.trim(),
              is_required: is_required.value,
              pregnancy_journal_id: pregnancy_journal_id.value,
            };
          },
          didOpen: async () => {
            const popup = Swal.getPopup();
            const selectElement = popup.querySelector("#pregnancy_journal_id");
            try {
              const response = await fetch(`${baseUrl}/journal`, {
                headers: { Authorization: token },
              });
              
              const data = await response.json();
              
              if (data.result) {
                selectElement.innerHTML = "";
                data.result.forEach((category) => {
                  const option = document.createElement("option");
                  option.value = category.id;
                  option.textContent = category.category_jurnal;
                  selectElement.appendChild(option);
                });
              } else {
                selectElement.innerHTML = "<option disabled>Tidak ada kategori tersedia</option>";
              }
            } catch (error) {
              console.error("Error loading pregnancy categories:", error);
            }
          },
        });
      
        if (formValues) {
          saveJournal(formValues);
        }
      }
      
      async function saveJournal(payload) {
        try {
          const url = isEdit
            ? `${baseUrl}/list_journal/${editId}`
            : `${baseUrl}/list_journal`;
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
          if (data.status === 200 || data.status === 201) {
            Swal.fire("Berhasil!", isEdit ? "Jurnal diperbarui!" : "Jurnal ditambahkan!", "success");
            fetchListJournal();
          } else {
            Swal.fire("Gagal!", data.msg, "error");
          }
        } catch (error) {
          console.error("Error saving journal:", error);
        }
      }

      async function handleEdit(e, data) {
        const id = e.target.dataset.id;
        const journal = data.find((item) => item.id == id);

        if (journal) {
          isEdit = true;
          editId = id;
          showJournalModal(journal);
        }
      }

      async function handleDelete(e) {
        const id = e.target.dataset.id;

        const result = await Swal.fire({
          title: "Hapus Jurnal?",
          text: "Anda yakin ingin menghapus jurnal ini?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hapus",
          cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
          try {
            const response = await fetch(`${baseUrl}/list_journal/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: token,
              },
            });

            const data = await response.json();
            if (data.status === 200) {
              Swal.fire("Berhasil!", "Jurnal berhasil dihapus.", "success");
              fetchListJournal();
            } else {
              Swal.fire("Gagal!", data.msg, "error");
            }
          } catch (error) {
            console.error("Error deleting journal:", error);
          }
        }
      }
    
      fetchListJournal();
    });
});
