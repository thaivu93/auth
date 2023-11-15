import http from 'http'
import url from 'url'
import crypto from 'crypto'

interface Session {
	user: string
}

const sessions: Record<string, Session> = {};

const server = http.createServer((req,res) => {
	const parsedUrl = url.parse(req.url || "", true);
	const path = parsedUrl.pathname || "";
	const queryParams = parsedUrl.query;


	// generate random session id
	const generateSessionId = ():string => {
		return crypto.randomBytes(16).toString('hex');
	}

	if (path === "/login") {
		//simulate user login
		const sessionId = generateSessionId();
		sessions[sessionId] = { user: 'exampleUser' };

		//set the sessionId as cookie
		res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`)

		res.writeHead(200, {'Content-Type': 'text/plain'})
		res.end('Login successful')
	} else if (path === '/dashboard') {
		 // Check if the user has a valid session
		const sessionId = req.headers.cookie?.split('sessionId=')[1]?.split(';')[0] || '';
		const session = sessions[sessionId];

		if (session) {
		  res.writeHead(200, { 'Content-Type': 'text/plain' });
		  res.end(`Welcome, ${session.user}!`);
		} else {
		  res.writeHead(401, { 'Content-Type': 'text/plain' });
		  res.end('Unauthorized - Please log in');
		}
	  } else if (path === '/logout') {
		// Logout by destroying the session
		const sessionId = req.headers.cookie?.split('sessionId=')[1]?.split(';')[0] || '';
		delete sessions[sessionId];

		// Clear the session ID cookie
		res.setHeader('Set-Cookie', `sessionId=; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);

		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end('Logout successful!');
	} else {
		res.writeHead(200, {'Content-type': 'text/plain'})
		res.end('Not Found');
	}
});

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Server listening to port ${PORT}`);
} )

