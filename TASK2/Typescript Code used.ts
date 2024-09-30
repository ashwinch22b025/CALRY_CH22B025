import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'requests.json');

// Defined types
type RequestStatus = 'received' | 'in progress' | 'awaiting confirmation' | 'completed' | 'canceled';

interface RoomServiceRequest {
  id: string;
  guestName: string;
  roomNumber: number;
  requestDetails: string;
  priority: number; // Lower numbers indicated higher priority
  status: RequestStatus;
}

// Used middleware to parse JSON
app.use(bodyParser.json());

// Helper function that read requests from JSON file
const readRequests = async (): Promise<RoomServiceRequest[]> => {
  const data = await fs.readFile(DATA_FILE);
  return JSON.parse(data.toString());
};

// Helper function that wrote requests to the JSON file
const writeRequests = async (requests: RoomServiceRequest[]): Promise<void> => {
  await fs.writeFile(DATA_FILE, JSON.stringify(requests, null, 2));
};

// API Endpoints

// POST /requests - Created a new service request
app.post('/requests', async (req: Request, res: Response) => {
  const { guestName, roomNumber, requestDetails, priority } = req.body; // Corrected line
  const id = Date.now().toString(); // Generated a unique ID
  const newRequest: RoomServiceRequest = { id, guestName, roomNumber, requestDetails, priority, status: 'received' };

  const requests = await readRequests();
  requests.push(newRequest);
  await writeRequests(requests);

  res.status(201).json(newRequest);
});

// GET /requests - Retrieved all requests sorted by priority
app.get('/requests', async (req: Request, res: Response) => {
  const requests = await readRequests();
  const sortedRequests = requests.sort((a, b) => a.priority - b.priority);
  res.json(sortedRequests);
});

// GET /requests/:id - Retrieved a specific request by ID
app.get('/requests/:id', async (req: Request, res: Response) => {
  const requests = await readRequests();
  const request = requests.find(r => r.id === req.params.id);

  if (request) {
    res.json(request);
  } else {
    res.status(404).json({ message: 'Request not found' });
  }
});

// PUT /requests/:id - Updated details or priority of an existing request
app.put('/requests/:id', async (req: Request, res: Response) => {
  const { guestName, roomNumber, requestDetails, priority } = req.body;
  const requests = await readRequests();
  const index = requests.findIndex(r => r.id === req.params.id);

  if (index !== -1) {
    const updatedRequest = { ...requests[index], guestName, roomNumber, requestDetails, priority };
    requests[index] = updatedRequest;
    await writeRequests(requests);
    res.json(updatedRequest);
  } else {
    res.status(404).json({ message: 'Request not found' });
  }
});

// DELETE /requests/:id - Removed a completed or canceled request
app.delete('/requests/:id', async (req: Request, res: Response) => {
  const requests = await readRequests();
  const index = requests.findIndex(r => r.id === req.params.id);

  if (index !== -1) {
    requests.splice(index, 1);
    await writeRequests(requests);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Request not found' });
  }
});

// POST /requests/:id/complete - Marked a request as completed
app.post('/requests/:id/complete', async (req: Request, res: Response) => {
  const requests = await readRequests();
  const index = requests.findIndex(r => r.id === req.params.id);

  if (index !== -1) {
    requests[index].status = 'completed';
    await writeRequests(requests);
    res.json(requests[index]);
  } else {
    res.status(404).json({ message: 'Request not found' });
  }
});

// Started the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
