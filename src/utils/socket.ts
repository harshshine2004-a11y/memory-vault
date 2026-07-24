import { io, Socket } from 'socket.io-client';

class RealtimeSocketManager {
  private socket: Socket | null = null;

  connect(serverUrl: string = 'http://localhost:5000') {
    if (this.socket) return;

    try {
      this.socket = io(serverUrl, {
        autoConnect: true,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to Memory Vault Realtime Socket Server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from Realtime Socket Server');
      });
    } catch {
      console.log('Socket server not reachable, using local reactive state');
    }
  }

  onNodeUpdated(callback: (data: any) => void) {
    this.socket?.on('node:updated', callback);
  }

  onPhotoUploaded(callback: (data: any) => void) {
    this.socket?.on('photo:uploaded', callback);
  }

  emitNodeChange(nodeData: any) {
    this.socket?.emit('node:change', nodeData);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketManager = new RealtimeSocketManager();
