"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3000;
const DATA_FILE = path_1.default.join(__dirname, 'requests.json');
// Used middleware to parse JSON
app.use(body_parser_1.default.json());
// Helper function that read requests from JSON file
const readRequests = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield fs_extra_1.default.readFile(DATA_FILE);
    return JSON.parse(data.toString());
});
// Helper function that wrote requests to the JSON file
const writeRequests = (requests) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_extra_1.default.writeFile(DATA_FILE, JSON.stringify(requests, null, 2));
});
// API Endpoints
// POST /requests - Created a new service request
app.post('/requests', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guestName, roomNumber, requestDetails, priority } = req.body; // Corrected line
    const id = Date.now().toString(); // Generated a unique ID
    const newRequest = { id, guestName, roomNumber, requestDetails, priority, status: 'received' };
    const requests = yield readRequests();
    requests.push(newRequest);
    yield writeRequests(requests);
    res.status(201).json(newRequest);
}));
// GET /requests - Retrieved all requests sorted by priority
app.get('/requests', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield readRequests();
    const sortedRequests = requests.sort((a, b) => a.priority - b.priority);
    res.json(sortedRequests);
}));
// GET /requests/:id - Retrieved a specific request by ID
app.get('/requests/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield readRequests();
    const request = requests.find(r => r.id === req.params.id);
    if (request) {
        res.json(request);
    }
    else {
        res.status(404).json({ message: 'Request not found' });
    }
}));
// PUT /requests/:id - Updated details or priority of an existing request
app.put('/requests/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { guestName, roomNumber, requestDetails, priority } = req.body;
    const requests = yield readRequests();
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index !== -1) {
        const updatedRequest = Object.assign(Object.assign({}, requests[index]), { guestName, roomNumber, requestDetails, priority });
        requests[index] = updatedRequest;
        yield writeRequests(requests);
        res.json(updatedRequest);
    }
    else {
        res.status(404).json({ message: 'Request not found' });
    }
}));
// DELETE /requests/:id - Removed a completed or canceled request
app.delete('/requests/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield readRequests();
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index !== -1) {
        requests.splice(index, 1);
        yield writeRequests(requests);
        res.status(204).send();
    }
    else {
        res.status(404).json({ message: 'Request not found' });
    }
}));
// POST /requests/:id/complete - Marked a request as completed
app.post('/requests/:id/complete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requests = yield readRequests();
    const index = requests.findIndex(r => r.id === req.params.id);
    if (index !== -1) {
        requests[index].status = 'completed';
        yield writeRequests(requests);
        res.json(requests[index]);
    }
    else {
        res.status(404).json({ message: 'Request not found' });
    }
}));
// Started the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
