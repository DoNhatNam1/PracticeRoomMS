import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Cpu, DoorOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getComputersForClient } from '../../api/computers';
import { Computer } from '../../types/computer-service/computers';
import { Room } from '../../types/room-service/rooms';

export default function ComputerSelection() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [computers, setComputers] = useState<Computer[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) return;
      
      try {
        setLoading(true);
        
        // Lấy thông tin phòng từ localStorage thay vì gọi API
        const savedRoom = localStorage.getItem('selectedRoom');
        if (savedRoom) {
          try {
            const parsedRoom = JSON.parse(savedRoom) as Room;
            // Kiểm tra roomId để đảm bảo là đúng phòng
            if (parsedRoom.id === parseInt(roomId)) {
              setRoom(parsedRoom);
            } else {
              // Nếu không khớp, có thể user đã truy cập trực tiếp URL
            }
          } catch (e) {
            console.error('Error parsing saved room data:', e);
          }
        }
        
        // Vẫn gọi API để lấy danh sách máy tính (đảm bảo API này không cần token)
        const computersResponse = await getComputersForClient(parseInt(roomId));
        if (computersResponse.success) {
          setComputers((computersResponse.data as any).computers);
        } else {
          setError(computersResponse.message || 'Failed to fetch computers');
        }
      } catch (error: any) {
        setError(error.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId]);

  const handleComputerSelect = (computerId: number) => {
    navigate(`/student/login/${roomId}/${computerId}`);
  };

  const handleBack = () => {
    navigate('/student/room-selection');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_USE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MAINTENANCE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'OUT_OF_ORDER': return 'bg-red-100 text-red-800 border-red-200';
      case 'OFFLINE': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'RESERVED': return 'bg-purple-100 text-purple-800 border-purple-200';
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
    <div className="container py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          className="gap-1" 
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Select a Computer</h1>
        <div style={{ width: 40 }}></div> {/* Spacer for alignment */}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <DoorOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium">
            Room: {room?.name || 'Loading...'}
          </h2>
          {room && (
            <Badge className={getStatusColor(room.status)}>
              {room.status}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Please select a computer to continue to login.
        </p>
      </Card>

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
      
      {!loading && !error && computers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-10 h-10 mb-2 text-amber-500" />
          <p className="text-amber-500">No computers available in this room.</p>
        </div>
      )}
      
      <motion.div 
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {computers.map(computer => (
          <motion.div key={computer.id} variants={item}>
            <Card className="overflow-hidden transition-shadow hover:shadow-md">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Cpu className="w-5 h-5 mr-2 text-gray-500" />
                    <h3 className="font-bold">{computer.name}</h3>
                  </div>
                  <Badge className={getStatusColor(computer.status)}>
                    {computer.status}
                  </Badge>
                </div>
                
                {computer.specs && (
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                    {computer.specs.os || 'Unknown OS'} • {computer.specs.processor || 'CPU N/A'} • {computer.specs.ram || 'RAM N/A'}
                  </p>
                )}
              </div>
              
              <CardFooter className="p-4 pt-3 pb-3 bg-gray-50">
                <Button 
                  className="w-full"
                  onClick={() => handleComputerSelect(computer.id)}
                  disabled={computer.status !== 'OPERATIONAL'}
                >
                  Select Computer
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}