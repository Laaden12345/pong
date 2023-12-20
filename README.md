# Pong

## Usage

Add .env file to project root:

```
PUBLIC_BACKEND_URL=<url for the backend, for example localhost>
PUBLIC_BACKEND_PORT=<port number>
PUBLIC_WEBSOCKET_PORT=<port number>
PUBLIC_LP_BACKEND_PORT=<port number>
FRONTEND_PORT=<port number>
```

Run `npm install` in both server and ui folders

Start the app with `docker compose up (--build when adding dependencies)`

To join the game, press space. Press enter to start the game

Move the horizontal paddle with A and D and the vertical paddle with W and S

R starts recording pings.
