import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoorOpen, Search, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiRequest } from '@/api/base';
import { Room } from '@/types/room-service/rooms';
import { Skeleton } from '@/components/ui/skeleton';

export default function RoomSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms.length > 0) {
      setFilteredRooms(
        rooms.filter(room => 
          room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, rooms]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      const response = await apiRequest<{
        success: boolean;
        message: string;
        data: {
          items: Room[];
          meta?: any;
        } | Room[] | { rooms: Room[] };
      }>('GET', '/rooms/client-view?status=AVAILABLE&limit=100');
      
      if (response && response.success) {
        
        let roomsData: Room[] = [];
        if (Array.isArray(response.data)) {
          // Case 1: API returns array directly
          roomsData = response.data as Room[];
        } else if (response.data && 'items' in response.data) {
          // Case 2: API returns paginated data with items
          roomsData = (response.data as { items: Room[] }).items;
        } else if (response.data && 'rooms' in response.data) {
          // Case 3: API returns object with rooms property
          roomsData = (response.data as { rooms: Room[] }).rooms;
        }
        
        const availableRooms = roomsData.filter(room => 
          room && room.id && room.name && room.status === 'AVAILABLE'
        );
        
        setRooms(availableRooms);
        setFilteredRooms(availableRooms);
      } else {
        console.error('Failed to fetch rooms:', response?.message);
        toast.error(response?.message || 'Failed to load rooms');
      }
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      toast.error(error.message || 'An error occurred while loading rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    // Lưu thông tin phòng đã chọn vào localStorage
    localStorage.setItem('selectedRoom', JSON.stringify(room));
    navigate(`/student/computer-selection/${room.id}`);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800',
      IN_USE: 'bg-blue-100 text-blue-800',
      MAINTENANCE: 'bg-amber-100 text-amber-800',
      CLOSED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container max-w-3xl py-12 mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/role-selection')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Role Selection
      </Button>
      
      <h1 className="mb-6 text-3xl font-bold">Select a Room</h1>
      
      <div className="relative mb-6">
        <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
        <Input
          placeholder="Search for a room..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <Skeleton className="w-1/2 h-4 mb-2" />
                  <Skeleton className="w-full h-3 mb-6" />
                  <div className="flex justify-between">
                    <Skeleton className="w-16 h-6" />
                    <Skeleton className="w-24 h-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-medium">{room.name}</h3>
                  <Badge className={getStatusColor(room.status)}>
                    {room.status}
                  </Badge>
                </div>
                <p className="mb-4 text-sm text-gray-500 line-clamp-2">
                  {room.description || `Room ${room.id}`}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <DoorOpen size={16} />
                    <span>Capacity: {room.capacity || 'N/A'}</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleRoomSelect(room)} // Truyền toàn bộ room object
                    disabled={room.status !== 'AVAILABLE'}
                  >
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <DoorOpen className="w-12 h-12 mb-4 text-gray-300" />
          <h3 className="mb-2 text-xl font-medium">No Rooms Available</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `No rooms match "${searchTerm}". Try a different search.` 
              : "No available rooms found. Please check back later."
            }
          </p>
        </div>
      )}
    </div>
  );
}