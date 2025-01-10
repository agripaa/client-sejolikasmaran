document.addEventListener('DOMContentLoaded', () => {
    fetch('/public/config.json')
        .then((response) => response.json())
        .then((config) => {
            const baseUrlApi = config.API_BASE_URL;
            const token = localStorage.getItem('token');
            const urlApiYoga = `${baseUrlApi}/class_yoga`; // API endpoint
            const tableBody = document.getElementById('class-table-body');
            const modal = document.getElementById('modal-container');
            const modalTitle = document.getElementById('modal-title');
            const closeModal = document.getElementById('close-modal');
            const yogaForm = document.getElementById('yoga-form');
            const urlLinkInput = document.getElementById('url-link');
            const addClassButton = document.getElementById('add-class-btn');

            let editId = null;

            const fetchClasses = async () => {
                try {
                    const response = await fetch(urlApiYoga, {
                        headers: { Authorization: token },
                    });
                    const { result } = await response.json();

                    if (result.length > 0) {
                        addClassButton.classList.add('hidden')
                    } else {
                        addClassButton.disabled = false;
                        addClassButton.textContent = 'Add Yoga Class';
                    }

                    // Render the class list
                    tableBody.innerHTML = result
                        .map(
                            (classYoga, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><a href="${classYoga.url_link}" target="_blank">${classYoga.url_link}</a></td>
                                <td class="action-buttons">
                                    <button class="btn btn-edit" data-id="${classYoga.id}" data-url="${classYoga.url_link}">Edit</button>
                                    <button class="btn-danger btn" data-id="${classYoga.id}">Delete</button>
                                </td>
                            </tr>
                        `
                        )
                        .join('');

                    attachEventListeners(); // Attach event listeners to dynamically generated buttons
                } catch (error) {
                    console.error('Error fetching classes:', error);
                }
            };

            // Attach event listeners to Edit and Delete buttons
            const attachEventListeners = () => {
                document.querySelectorAll('.btn-edit').forEach((button) =>
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id');
                        const url = button.getAttribute('data-url');

                        // Set modal for editing
                        modalTitle.textContent = 'Edit Yoga Class';
                        urlLinkInput.value = url;
                        editId = id; // Save the ID for update
                        modal.classList.remove('hidden');
                    })
                );

                document.querySelectorAll('.btn-danger').forEach((button) =>
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id');
                        Swal.fire({
                            title: 'Are you sure?',
                            text: "You won't be able to revert this!",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, delete it!',
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                try {
                                    await fetch(`${urlApiYoga}/${id}`, {
                                        method: 'DELETE',
                                        headers: { Authorization: token },
                                    });
                                    Swal.fire('Deleted!', 'The class has been deleted.', 'success');
                                    fetchClasses();
                                } catch (error) {
                                    console.error('Error deleting class:', error);
                                    Swal.fire('Error!', 'Failed to delete the class.', 'error');
                                }
                            }
                        });
                    })
                );
            };

            // Open modal for adding a new class
            addClassButton.addEventListener('click', () => {
                modalTitle.textContent = 'Add Yoga Class';
                urlLinkInput.value = '';
                editId = null; // Reset edit ID
                modal.classList.remove('hidden');
            });

            // Close modal
            closeModal.addEventListener('click', () => {
                modal.classList.add('hidden');
            });

            // Submit form
            yogaForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const urlLink = urlLinkInput.value;

                try {
                    if (editId) {
                        // Update existing class
                        await fetch(`${urlApiYoga}/${editId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: token,
                            },
                            body: JSON.stringify({ url_link: urlLink }),
                        });
                        Swal.fire('Updated!', 'The yoga class has been updated.', 'success');
                    } else {
                        // Add new class
                        await fetch(urlApiYoga, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: token,
                            },
                            body: JSON.stringify({ url_link: urlLink }),
                        });
                        Swal.fire('Created!', 'The yoga class has been added.', 'success');
                    }

                    modal.classList.add('hidden');
                    fetchClasses();
                } catch (error) {
                    console.error('Error saving class:', error);
                    Swal.fire('Error!', 'Failed to save the class.', 'error');
                }
            });

            // Initialize
            fetchClasses();
        });
});
