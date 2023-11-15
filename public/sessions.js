"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const crypto_1 = __importDefault(require("crypto"));
const sessions = {};
const server = http_1.default.createServer((req, res) => {
    var _a, _b, _c, _d;
    const parsedUrl = url_1.default.parse(req.url || "", true);
    const path = parsedUrl.pathname || "";
    const queryParams = parsedUrl.query;
    const generateSessionId = () => {
        return crypto_1.default.randomBytes(16).toString('hex');
    };
    if (path === "/login") {
        const sessionId = generateSessionId();
        sessions[sessionId] = { user: 'exampleUser' };
        res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Login successful');
    }
    else if (path === '/dashboard') {
        const sessionId = ((_b = (_a = req.headers.cookie) === null || _a === void 0 ? void 0 : _a.split('sessionId=')[1]) === null || _b === void 0 ? void 0 : _b.split(';')[0]) || '';
        const session = sessions[sessionId];
        if (session) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Welcome, ${session.user}!`);
        }
        else {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Unauthorized - Please log in');
        }
    }
    else if (path === '/logout') {
        const sessionId = ((_d = (_c = req.headers.cookie) === null || _c === void 0 ? void 0 : _c.split('sessionId=')[1]) === null || _d === void 0 ? void 0 : _d.split(';')[0]) || '';
        delete sessions[sessionId];
        res.setHeader('Set-Cookie', `sessionId=; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Logout successful!');
    }
    else {
        res.writeHead(200, { 'Content-type': 'text/plain' });
        res.end('Not Found');
    }
});
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening to port ${PORT}`);
});
