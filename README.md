## Features

-   Real-time collaborative drawing.
-   Adjustable brush color and size.
-   Canvas reset functionality.
-   User connection and disconnection notifications.
-   Display of the number of connected users.
-   Responsive canvas that adapts to different screen sizes.

## Technologies Used

-   **Frontend:**
    -   React
    -   HTML5 Canvas
    -   CSS
-   **Backend:**
    -   Node.js
    -   WebSocket (ws)
    -   Express.js
    -   CORS

## Setup Instructions

### Environment Variables

-   **`REACT_APP_API_URL` (Client):**
    -   Specifies the WebSocket server URL. If not set, the client will attempt to connect to the server on the same host and port 10000.
    -   Example: `ws://your-server-domain:10000` or `wss://your-server-domain:10000`
-   **`PORT` (Server):**
    -   Specifies the port the WebSocket server listens on. Defaults to 10000.
-   **`NODE_ENV` (Server):**
    -   If set to `production`, the server will serve the built React application.
-   **`SERVE_FRONTEND` (Server):**
    -   If set to `true` when `NODE_ENV` is `production`, the server will serve the static files from the React build directory.

### Backend Setup

1.  **Navigate to the server directory:**
    ```bash
    cd collaborative-drawing-app/server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    node server.js
    ```
    or fir the development server with
    ```bash
    npm run dev
    ```
    The server will start on port 10000 by default.

### Frontend Setup

1.  **Navigate to the client directory:**
    ```bash
    cd collaborative-drawing-app/client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm start
    ```
    The app will open in your browser at `http://localhost:3000`.

### Production Build

1.  **Build the React application:**
    ```bash
    cd collaborative-drawing-app/client
    npm run build
    ```
2.  **Serve the build from the server:**
    -   Ensure you set `process.env.NODE_ENV` to `production` and `process.env.SERVE_FRONTEND` to `true` in your server environment.
    -   The Node.js server will serve the static files from the `build` directory.


