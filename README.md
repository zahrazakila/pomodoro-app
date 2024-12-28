# **Pomodoro Timer with Spotify Integration**

This project is a Pomodoro timer with Spotify integration and a playlist selection feature. It allows users to focus on tasks with music and take breaks as per the Pomodoro technique.

---

## **Features**
- **Spotify Integration**: Play your favorite playlists during focus sessions.
- **Custom Timer**: Includes focus and break intervals with configurable durations.
- **Pause and Resume**: Pause and resume both the timer and music.
- **Responsive Design**: Optimized for both desktop and mobile devices.

---

## **Getting Started**

### **Prerequisites**

1. **Node.js**: Install the latest LTS version from [Node.js Official Website](https://nodejs.org/).
2. **Spotify Developer Account**: Register at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
3. **Git**: Install Git from [Git Official Website](https://git-scm.com/).

---

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone <URL-REPOSITORY-GITHUB>
   ```
   Replace `<URL-REPOSITORY-GITHUB>` with the actual repository URL.

2. **Navigate to the Project Directory**
   ```bash
   cd <project-directory>
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment Variables**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   SPOTIFY_CLIENT_ID=<Your-Spotify-Client-ID>
   SPOTIFY_CLIENT_SECRET=<Your-Spotify-Client-Secret>
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   DATABASE_URL=<Your-Database-Connection-String>
   ```
   Replace placeholders (`<...>`) with your actual credentials.

5. **Start the Application**
   ```bash
   npm start
   ```
   The app will run at `http://localhost:3000` by default.

---

### **Spotify Integration Setup**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).
2. Create a new app.
3. Note down the `Client ID` and `Client Secret`.
4. Set the Redirect URI in the app settings to `http://localhost:3000/callback`.

---

## **Usage**

1. Open the application in your browser.
2. Select a playlist from the Spotify playlist dropdown.
3. Start the Pomodoro timer.
4. Pause or resume the timer and music as needed.
5. Follow the alerts for break and focus intervals.

---

## **Project Structure**

```
.
├── public
├── src
│   ├── components
│   │   └── Timer.js
│   ├── styles
│   │   └── main.css
│   ├── utils
│       └── spotify.js
├── .env
├── package.json
└── README.md
```

---

## **Contributing**

Feel free to fork the repository and submit pull requests. Contributions are welcome!

---

## **Troubleshooting**

- **Spotify Errors**:
  - Ensure a Spotify device is active.
  - Check if the access token is valid.

- **Timer Issues**:
  - Refresh the page if the timer does not start.

- **Dependency Issues**:
  - Run `npm install` again if some packages are missing.

---

## **License**

This project is licensed under the MIT License. See `LICENSE` for details.
