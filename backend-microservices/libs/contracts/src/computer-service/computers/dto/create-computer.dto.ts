export class CreateComputerDto {
    name: string; // The name of the computer
    ipAddress?: string; // The IP address of the computer (optional)
    macAddress?: string; // The MAC address of the computer (optional)
    status?: string; // The status of the computer (e.g., available, in use, maintenance) (optional)
    roomId?: number; // The ID of the room where the computer is located (optional)
    specs?: { // The specifications of the computer (optional)
        cpu?: string; // The CPU model (optional)
        ram?: string; // The RAM size (optional)
        storage?: string; // The storage size (optional)
        gpu?: string; // The GPU model (if applicable) (optional)
    };
}
