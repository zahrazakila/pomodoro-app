require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const mysql = require('mysql');
const bodyParser = require('body-parser');  // Tambahkan body-parser
const session = require('express-session');
const app = express();


app.use(express.static(__dirname + '/frontend'));
app.use(express.json());
app.use(bodyParser.json());  // Parsing JSON
app.use(bodyParser.urlencoded({ extended: true }));  // Parsing form-urlencoded



// Setup session
app.use(session({
  secret: 'your_secret_key',  // Ganti dengan key aman
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // true jika HTTPS
}));


// Koneksi ke Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // Ganti sesuai password MySQL kamu
  database: 'pomodoro_app'
});

db.connect(err => {
  if (err) {
      console.error('Failed to connect to database:', err);
      return;
  }
  console.log('Connected to MySQL');
});

// Ambil semua tugas dari database
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
      if (err) {
          console.error('Failed to fetch tasks:', err);
          res.status(500).send('Failed to fetch tasks');
      } else {
          res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');  // Tambah header
          console.log('Tasks fetched:', results);  // Debugging
          res.json(results);
      }
  });
});

// Tambah tugas baru ke database
app.post('/tasks', (req, res) => {
  const { task } = req.body;
  console.log('Received task:', req.body);  // Log untuk cek data yang dikirim
  if (!task) {
      return res.status(400).send('Task cannot be empty');
  }

  db.query('INSERT INTO tasks (task_name, is_completed) VALUES (?, 0)', [task], (err, result) => {
      if (err) {
          res.status(500).send('Failed to add task');
      } else {
          res.json({ id: result.insertId, task_name: task, is_completed: 0 });
      }
  });
});


// Update status tugas (mark as completed)
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.query('UPDATE tasks SET is_completed = 1 WHERE id = ?', [id], (err, result) => {
      if (err) {
          res.status(500).send('Failed to update task');
      } else {
          res.send('Task marked as completed');
      }
  });
});

// Hapus tugas dari database
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
      if (err) {
          res.status(500).send('Failed to delete task');
      } else {
          res.send('Task deleted');
      }
  });
});


let globalAccessToken = '';
let globalRefreshToken = '';

// Spotify API Config
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});


// Middleware hanya untuk route Spotify (bukan untuk semua route)
function checkSpotifyToken(req, res, next) {
    if (!globalAccessToken) {
        console.log('No Spotify token found. Displaying login prompt.');
        return res.send(`
            <h1>Spotify Login Required</h1>
            <p>No active Spotify session found. Please <a href="/login">log in</a>.</p>
        `);
    }
    next();
}

// Terapkan hanya pada route Spotify
app.use('/playlists', checkSpotifyToken);
app.use('/play', checkSpotifyToken);
app.use('/pause', checkSpotifyToken);
app.use('/resume', checkSpotifyToken);

// Refresh token function (Pindah ke atas)
async function refreshAccessToken(req, res, next) {
  try {
      if (!req.session.spotifyRefreshToken) {
          console.log('No refresh token. Redirecting to /login...');
          return res.redirect('/login');
      }
      const data = await spotifyApi.refreshAccessToken();
      req.session.spotifyAccessToken = data.body['access_token'];
      spotifyApi.setAccessToken(data.body['access_token']);
      console.log('Access token refreshed!');
      next();
  } catch (err) {
      console.error('Failed to refresh token:', err);
      res.redirect('/login');
  }
}


// Route untuk login ke Spotify
app.get('/login', (req, res) => {
  const scopes = ['user-read-playback-state', 'user-modify-playback-state'];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Callback setelah login Spotify
app.get('/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const data = await spotifyApi.authorizationCodeGrant(code);

    globalAccessToken = data.body['access_token'];
    globalRefreshToken = data.body['refresh_token'];
    const expiresAt = new Date(new Date().getTime() + data.body['expires_in'] * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    
    req.session.accessToken = data.body['access_token'];
    req.session.refreshToken = data.body['refresh_token'];

    spotifyApi.setAccessToken(globalAccessToken);
    spotifyApi.setRefreshToken(globalRefreshToken);

    console.log('Spotify token saved to session!');

    // Gunakan koneksi database yang sudah dibuka
    db.query(
      'INSERT INTO spotify_sessions (user_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), refresh_token = VALUES(refresh_token), expires_at = VALUES(expires_at)',
      ['user123', globalAccessToken, globalRefreshToken, expiresAt],
      (err) => {
        if (err) {
          console.error('Failed to save token to DB:', err);
          return res.status(500).send('Failed to save token.');
        }
        console.log('Spotify token saved to database!');
        
        // Hanya redirect ke halaman utama jika berhasil menyimpan token
        res.redirect('/');
      }
    );
  } catch (err) {
    console.error('Error during callback:', err);

    if (err.body && err.body.error === 'invalid_grant') {
      res.status(400).send('Invalid Spotify login. Please try again.');
    } else {
      res.status(500).send('Failed to log in. Please try again later.');
    }
  }
});

// Route untuk halaman utama
app.get('/', async (req, res) => {
  if (!req.session.accessToken) {
    console.log('No Spotify token found. Redirecting to login...');
    return res.redirect('/login');
  }

  res.sendFile(__dirname + '/frontend/index.html');
});


// Route untuk fetch playlist Spotify pengguna
app.get('/playlists', async (req, res) => {
  try {
      // Cek apakah token ada
      if (!globalAccessToken) {
          console.log('Access token missing. Redirecting to login...');
          return res.redirect('/login');
      }

      spotifyApi.setAccessToken(globalAccessToken);
      const data = await spotifyApi.getUserPlaylists();
      res.json(data.body.items);
  } catch (err) {
      if (err.statusCode === 401) {
          // Token expired, lakukan refresh
          console.log('Token expired. Refreshing...');
          try {
              await refreshAccessToken();
              const data = await spotifyApi.getUserPlaylists();
              res.json(data.body.items);
          } catch (refreshErr) {
              console.error('Failed to refresh token:', refreshErr);
              res.redirect('/login');
          }
      } else {
          console.error('Failed to fetch playlists:', err);
          res.status(500).send('Failed to fetch playlists.');
      }
  }
});

// Route untuk memutar playlist
app.post('/play', async (req, res) => {
    const playlistUri = req.body.playlistUri;

    try {
        // Refresh token jika diperlukan sebelum play
        if (!globalAccessToken) {
            console.log('Access token missing. Refreshing...');
            await refreshAccessToken();
        }
        spotifyApi.setAccessToken(globalAccessToken);

        const devices = await spotifyApi.getMyDevices();
        const activeDevice = devices.body.devices.find(device => device.is_active);

        if (!activeDevice) {
            console.log('No active Spotify device found!');
            return res.status(400).json({ error: 'No active Spotify device found!' });
        }

        await spotifyApi.play({
            context_uri: playlistUri,
            device_id: activeDevice.id
        });

        res.send('Playlist is playing!');
    } catch (err) {
        console.error('Failed to play:', err.body || err);
        res.status(500).json({ error: 'Failed to play playlist.' });
    }
});

app.put('/pause', async (req, res) => {
    try {
        await spotifyApi.pause();
        res.send('Spotify Paused');
    } catch (err) {
        console.error('Failed to pause Spotify:', err.body || err);
        res.status(500).send('Failed to pause Spotify.');
    }
});

app.put('/resume', async (req, res) => {
    try {
        const playbackState = await spotifyApi.getMyCurrentPlaybackState();
        
        console.log('Playback State:', playbackState.body);

        if (playbackState.body && playbackState.body.is_playing === false) {
            // Jika playback paused, gunakan play() untuk melanjutkan
            await spotifyApi.play();
            res.send('Spotify Resumed');
        } else if (playbackState.body && playbackState.body.is_playing === true) {
            // Jika sudah playing, kirimkan respons bahwa Spotify sedang berjalan
            res.send('Spotify is already playing');
        } else {
            // Jika tidak ada sesi pemutaran, mulai dari awal playlist
            const playlistUri = req.body.playlistUri || 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M';
            await spotifyApi.play({
                context_uri: playlistUri
            });
            res.send('Started playlist from beginning');
        }
    } catch (err) {
        console.error('Failed to resume Spotify:', err.body || err);
        res.status(500).send('Failed to resume Spotify.');
    }
});



// Jalankan server
app.listen(8888, () => {
  console.log('Server running on http://localhost:8888');
});
