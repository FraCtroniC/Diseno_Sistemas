const EventEmitter = require('events');

class SSEService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map();
  }

  addClient(userId, res) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(res);

    res.on('close', () => {
      this.clients.get(userId)?.delete(res);
      if (this.clients.get(userId)?.size === 0) {
        this.clients.delete(userId);
      }
    });
  }

  notifyUser(userId, data) {
    const clients = this.clients.get(userId);
    if (!clients) return;
    for (const res of clients) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }

  notifyAll(data) {
    for (const [userId] of this.clients) {
      this.notifyUser(userId, data);
    }
  }
}

module.exports = new SSEService();
