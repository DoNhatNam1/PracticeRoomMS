import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DoorOpen, Users, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // Thêm import Skeleton
import { getRoomsForClient } from '../../api/rooms';
import { Room } from '../../types/room-service/rooms';
import { RoomStatus } from '@/types';

export default function RoomSelection() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await getRoomsForClient();
        
        if (response.success) {
          // Chỉ hiển thị các phòng đang hoạt động
          const activeRooms = response.data
          setRooms(activeRooms);
        } else {
          setError(response.message || 'Failed to fetch rooms');
        }
      } catch (error: any) {
        setError(error.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomSelect = (roomId: number) => {
    navigate(`/teacher/login/${roomId}`);
  };

  const handleBack = () => {
    navigate('/role-selection');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_USE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MAINTENANCE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLOSED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container p-8">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          className="gap-1" 
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Select a Practice Room</h1>
        <div style={{ width: 40 }}></div> {/* Spacer for alignment */}
      </div>

      <Card className="p-4 mb-6">
        <p className="text-muted-foreground">
          Please select a practice room to continue to login.
        </p>
      </Card>

      {/* Skeleton loading state */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Skeleton className="w-5 h-5 mr-2" />
                    <Skeleton className="w-24 h-5" />
                  </div>
                  <Skeleton className="w-20 h-5" />
                </div>
                
                <Skeleton className="w-full h-4 mb-3" />
                <Skeleton className="w-3/4 h-4 mb-3" />
                
                <div className="flex items-center">
                  <Skeleton className="w-4 h-4 mr-1" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              
              <CardFooter className="p-4 pt-3 pb-3 bg-gray-50">
                <Skeleton className="w-full h-9" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-10 h-10 mb-2 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      {!loading && !error && rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-10 h-10 mb-2 text-amber-500" />
          <p className="text-amber-500">No available rooms found.</p>
        </div>
      )}
      
      {!loading && !error && rooms.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {rooms.map(room => (
            <motion.div key={room.id} variants={item}>
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <DoorOpen className="w-5 h-5 mr-2 text-gray-500" />
                      <h3 className="font-bold">{room.name}</h3>
                    </div>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                  </div>
                  
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                    {room.location || 'No location specified'}
                  </p>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Capacity: {room.capacity}</span>
                  </div>
                </div>
                
                <CardFooter className="p-4 pt-3 pb-3 bg-gray-50">
                  <Button 
                    className="w-full"
                    onClick={() => handleRoomSelect(room.id)}
                    disabled={room.status === ('RESERVED' as RoomStatus) || room.status === ('MAINTENANCE' as RoomStatus)}
                  >
                    Select Room
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}