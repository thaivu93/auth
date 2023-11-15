import http from 'http';
import url from 'url';
import crypto from 'crypto';
import querystring from 'querystring';

const secretKey = 'your_secret_key';

interface User {
    id: number;
    username: string;
    password: string;
}

const users: User[] = [{ id: 1, username: 'user1', password: 'password1' }];

// login by username and password
const generateToken = (user: User): string => {
    const payload = { id: user.id, username: user.username };
    const payloadString = JSON.stringify(payload);
    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(payloadString)
        .digest('base64');
    const token = `${payloadString}.${signature}`;
    return token;
};

type verifyTokenResult = object | null;

// compare payload with signature
const verifyToken = (token: string): verifyTokenResult => {
    const tokenFromHeader = token.split(' ')[1];
    const [payload, signature] = tokenFromHeader.split('.');
    console.log(`payload: ${payload}`);
    console.log(`signature: ${signature}`);

    const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('base64');

    return signature === expectedSignature ? JSON.parse(payload) : null;
};

//server app
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url || '', true);
    console.log(parsedUrl);
    const path = parsedUrl.path || '';
    console.log(path);
    const queryParams = parsedUrl.query;

    if (path === '/login' && req.method === 'POST') {
        let body = '';

        req.on('data', (chunk) => {
            // append data to body
            body += chunk.toString();
        });

        req.on('end', () => {
            const { username, password } = querystring.parse(body);
            console.log(`u: ${username}, p: ${password}`);
            const user = users.find(
                (u) => u.username === username && u.password === password
            );

            if (user) {
                const token = generateToken(user);
                console.log(`Generated token: ${token}`);
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.end(JSON.stringify({ token }));
            } else {
                res.writeHead(401, { 'Content-type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid credentials' }));
            }
        });
    } else if (path === '/secure' && req.method === 'GET') {
        const token = req.headers['authorization'];
        console.log(`Received token: ${token}`);

        if (!token) {
            res.writeHead(403, { 'Content-type': 'application/json' });
            res.end(JSON.stringify({ message: 'Token not provided' }));
            return;
        }

        const decodedPayload = verifyToken(token);
        console.log(decodedPayload);

        if (decodedPayload) {
            res.writeHead(200, { 'Content-type': 'application/json' });
            res.end(
                JSON.stringify({
                    message: 'This is a secured endpoint',
                    user: decodedPayload,
                })
            );
        } else {
            res.writeHead(401, { 'Content-type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid token' }));
        }
    } else {
        res.writeHead(404, { 'Content-type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
