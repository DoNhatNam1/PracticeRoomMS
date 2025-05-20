import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'file-transfers',
  cors: {
    origin: '*',
  },
})
export class FileTransferGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(FileTransferGateway.name);
  private computerConnections = new Map<number, Socket[]>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const computerId = client.handshake.query.computerId;
      
      if (!computerId) {
        client.disconnect();
        return;
      }

      // Store connection mapped to computer ID
      if (!this.computerConnections.has(+computerId)) {
        this.computerConnections.set(+computerId, []);
      }
      
      const connections = this.computerConnections.get(+computerId);
      if (connections) {
        connections.push(client);
      }
      this.logger.log(`Computer ${computerId} connected to file transfer socket`);
      
      // Join room for this computer
      client.join(`computer-${computerId}`);
      
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Clean up connection tracking
    for (const [computerId, clients] of this.computerConnections.entries()) {
      const index = clients.indexOf(client);
      if (index !== -1) {
        clients.splice(index, 1);
        this.logger.log(`Computer ${computerId} disconnected from file transfer socket`);
        
        if (clients.length === 0) {
          this.computerConnections.delete(computerId);
        }
        break;
      }
    }
  }

  // Method to notify computers of new file transfers
  notifyNewFileTransfer(targetComputerIds: number[], transferData: any) {
    for (const computerId of targetComputerIds) {
      this.server.to(`computer-${computerId}`).emit('file:new', transferData);
      this.logger.log(`Notified computer ${computerId} of new file transfer`);
    }
  }

  // Method to update file transfer status
  updateFileTransferStatus(computerId: number, transferData: any) {
    this.server.to(`computer-${computerId}`).emit('file:statusUpdate', transferData);
  }
}