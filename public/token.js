"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const crypto_1 = __importDefault(require("crypto"));
const querystring_1 = __importDefault(require("querystring"));
const secretKey = 'your_secret_key';
const users = [{ id: 1, username: 'user1', password: 'password1' }];
const generateToken = (user) => {
    const payload = { id: user.id, username: user.username };
    const payloadString = JSON.stringify(payload);
    const signature = crypto_1.default
        .createHmac('sha256', secretKey)
        .update(payloadString)
        .digest('base64');
    const token = `${payloadString}.${signature}`;
    return token;
};
const verifyToken = (token) => {
    const tokenFromHeader = token.split(' ')[1];
    const [payload, signature] = tokenFromHeader.split('.');
    console.log(`payload: ${payload}`);
    console.log(`signature: ${signature}`);
    const expectedSignature = crypto_1.default
        .createHmac('sha256', secretKey)
        .update(payload)
        .digest('base64');
    return signature === expectedSignature ? JSON.parse(payload) : null;
};
const server = http_1.default.createServer((req, res) => {
    const parsedUrl = url_1.default.parse(req.url || '', true);
    console.log(parsedUrl);
    const path = parsedUrl.path || '';
    console.log(path);
    const queryParams = parsedUrl.query;
    if (path === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { username, password } = querystring_1.default.parse(body);
            console.log(`u: ${username}, p: ${password}`);
            const user = users.find((u) => u.username === username && u.password === password);
            if (user) {
                const token = generateToken(user);
                console.log(`Generated token: ${token}`);
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.end(JSON.stringify({ token }));
            }
            else {
                res.writeHead(401, { 'Content-type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid credentials' }));
            }
        });
    }
    else if (path === '/secure' && req.method === 'GET') {
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
            res.end(JSON.stringify({
                message: 'This is a secured endpoint',
                user: decodedPayload,
            }));
        }
        else {
            res.writeHead(401, { 'Content-type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid token' }));
        }
    }
    else {
        res.writeHead(404, { 'Content-type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not found' }));
    }
});
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
