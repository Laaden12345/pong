# Pong

## Usage
Add .env file to project root and under pong-ui folder 

`./.env:`
```
BACKEND_PORT=<port number>
FRONTEND_PORT=<port number>
```

`./pong-ui/.env:`
```
PUBLIC_BACKEND_PORT=<port number>
FRONTEND_PORT=<port number>
```

Run `npm install` in both server and ui folders

Start the app with `docker compose up (--build)`