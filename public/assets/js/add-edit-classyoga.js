document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const form = document.getElementById('classyoga-form');
    const urlLinkInput = document.getElementById('url-link');
    const title = document.getElementById('form-title');

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    fetch('/public/config.json')
        .then(response => response.json())
        .then(config => {
            const apiBaseUrl = config.API_BASE_URL;

            const fetchYogaClassDetails = async () => {
                try {
                    const response = await fetch(`${apiBaseUrl}/class_yoga/${id}`, {
                        headers: { Authorization: token },
                    });
                    const { result } = await response.json();
                    urlLinkInput.value = result.url_link;
                    title.textContent = 'Edit Yoga Class';
                } catch (error) {
                    console.error('Error fetching class details:', error);
                }
            };

            const saveYogaClass = async (e) => {
                e.preventDefault();
                const urlLink = urlLinkInput.value;

                try {
                    const method = id ? 'PATCH' : 'POST';
                    const endpoint = id ? `${apiBaseUrl}/class_yoga/${id}` : `${apiBaseUrl}/class_yoga`;

                    await fetch(endpoint, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: token,
                        },
                        body: JSON.stringify({ url_link: urlLink }),
                    });

                    alert('Class saved successfully!');
                    window.location.href = '/public/admin/kelas-yoga/preview-classyoga.html';
                } catch (error) {
                    console.error('Error saving class:', error);
                }
            };

            if (id) fetchYogaClassDetails();
            form.addEventListener('submit', saveYogaClass);
        });
});
