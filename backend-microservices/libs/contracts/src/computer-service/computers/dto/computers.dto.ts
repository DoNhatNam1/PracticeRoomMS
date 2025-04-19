export class ComputerDto {
    id: number;
    name: string;
    ipAddress?: string;
    macAddress?: string;
    status: string; // 'active' | 'inactive'
    roomId?: number;
    room?: any;
    specs?: any;
    // ... có thể có các trường khác
}
