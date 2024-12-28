let selectedPlaylist = '';

// Ambil Playlist dari Spotify API
window.addEventListener('DOMContentLoaded', fetchSpotifyPlaylists);

function fetchSpotifyPlaylists() {
    fetch('/playlists')
    .then(response => {
        if (response.redirected) {
            // Jika server merespons dengan redirect (belum login), langsung redirect ke halaman login Spotify
            window.location.href = response.url;
        }
        return response.json();
    })
    .then(playlists => {
        const playlistContainer = document.getElementById('playlist');
        playlistContainer.innerHTML = '';  // Kosongkan playlist sebelumnya

        // Render setiap playlist
        playlists.forEach(playlist => {
            playlistContainer.innerHTML += `
                <li class="playlist-item bg-gray-100 rounded-lg shadow-md hover:shadow-xl transition-all" data-uri="${playlist.uri}">
                    <div class="flex items-center justify-between p-4">
                        <p class="text-lg font-medium">${playlist.name}</p>
                        <button class="select-playlist w-full sm:w-auto py-3 px-8 btn-primary text-white text-lg font-semibold rounded-lg shadow-lg transition duration-200">
                            Select
                        </button>
                    </div>
                </li>
            `;
        });

        // Tambahkan Event Listener ke Button Select (dynamically)
        document.querySelectorAll('.select-playlist').forEach(button => {
            button.addEventListener('click', (event) => {
                selectedPlaylist = event.target.closest('.playlist-item').getAttribute('data-uri');
                alert('Playlist Selected!');
            });
        });
    })
    .catch(err => {
        console.error('Failed to fetch playlists:', err);

        // Tambahkan alert untuk memberikan opsi login manual jika fetch gagal
        if (confirm('Failed to load playlists. Do you want to log in to Spotify?')) {
            window.location.href = '/login';
        }
    });
}


// Play Spotify Playlist
function playSpotify() {
    if (!selectedPlaylist) {
        alert('Please select a playlist first!');
        return Promise.reject('No playlist selected');  // Reject jika tidak ada playlist
    }

    return fetch('/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playlistUri: selectedPlaylist })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Failed to play Spotify');
            });
        }
        return 'ok';  // Kembalikan status OK tanpa alert
    })
        .catch(err => {
        // Tambahkan alert saat tidak ada device aktif
        const errorMessage = err.message || 'Failed to play Spotify. Please try again.';
        alert(errorMessage);  // Munculkan error sebagai alert
        console.error('Spotify error:', err);
        throw err;  // Lempar error agar bisa ditangkap di event listener
    });
}




// Resume Spotify Playback (After Break)
function resumeSpotify() {
    fetch('/resume', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playlistUri: selectedPlaylist })
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 403) {
                alert('No active Spotify device found. Please open Spotify.');
            } else {
                throw new Error('Failed to resume Spotify');
            }
        }
        return response.text();
    })
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        alert(err.message);
        console.error(err);
    });
}

// Pause Spotify Playback
function pauseSpotify() {
    fetch('/pause', { method: 'PUT' })
    .then(response => response.text())
    .then(data => {
        console.log('Spotify Paused');
    })
    .catch(err => {
        alert('Failed to pause Spotify');
        console.error(err);
    });
}

// Export functions to use in app.js
window.resumeSpotify = resumeSpotify;
window.playSpotify = playSpotify;
window.pauseSpotify = pauseSpotify;
