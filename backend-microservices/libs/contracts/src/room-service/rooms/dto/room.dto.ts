export class RoomDto {
  id: number;
  name: string;  // Đảm bảo đây là name, không phải title
  capacity?: number;
  location?: string;
  description?: string;
  status?: string;
  // Các trường khác nếu cần
}
