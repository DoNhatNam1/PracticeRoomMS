import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Play, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Upload,
  FileUp,
  X,
  Info,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter, 
  DialogClose, 
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from '@/api/base';
import { Room } from '@/types/room-service/rooms';
import { Computer } from '@/types/computer-service/computers';

interface FileTransferTarget {
  id: number;
  fileTransferId: number;
  computerId: number;
  status: string;
  computer?: {
    id: number;
    name: string;
  };
}

interface FileTransfer {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  sourceId: number;
  transferredAt: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  targets: FileTransferTarget[];
}

export default function TeacherComputers() {
  const { roomId } = useParams<{ roomId: string }>();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fileTransfers, setFileTransfers] = useState<FileTransfer[]>([]);
  const [fileTransfersLoading, setFileTransfersLoading] = useState(false);

  // Thêm state để lưu máy tính của giáo viên
  const [teacherComputer, setTeacherComputer] = useState<Computer | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      if (!roomId || !token) return;
      
      try {
        setLoading(true);
        
        // Kiểm tra cache trước khi gọi API
        const cachedRoomId = localStorage.getItem('lastTeacherRoomId');
        const cachedComputers = localStorage.getItem(`computers_${roomId}`);
        const cachedTeacherComputer = localStorage.getItem(`teacherComputer_${roomId}`);
        
        // Chỉ gọi API nếu chưa có cache hoặc roomId đã thay đổi
        if (!cachedComputers || cachedRoomId !== roomId) {
          
          // Sửa kiểu dữ liệu của response
          const response = await apiRequest<{
            success: boolean;
            message: string;
            computers: Computer[] 
          }>('GET', `/computers/client-view?roomId=${roomId}`);
          
          if (response.success) {
            const computersList = response.data.computers || [];
            setComputers(computersList);
            
            // Lưu vào cache
            localStorage.setItem(`computers_${roomId}`, JSON.stringify(computersList));
            
            // Tìm máy tính của Teacher - PC-<roomId>-1
            const teacherComputerName = `PC-${roomId}-1`;
            const foundTeacherComputer = computersList.find(
              comp => comp.name === teacherComputerName
            );
            
            if (foundTeacherComputer) {
              setTeacherComputer(foundTeacherComputer);
              localStorage.setItem(`teacherComputer_${roomId}`, JSON.stringify(foundTeacherComputer));
            } else {
              // Nếu không tìm thấy máy tính với tên chính xác, lấy máy tính đầu tiên
              const firstComputer = computersList[0];
              if (firstComputer) {
                setTeacherComputer(firstComputer);
                localStorage.setItem(`teacherComputer_${roomId}`, JSON.stringify(firstComputer));
              }
            }
            
            // Cập nhật thông tin phòng từ computer đầu tiên
            if (computersList.length > 0) {
              const firstComputer = computersList[0];
              if (firstComputer.room) {
                const roomData = {
                  id: firstComputer.room.id,
                  name: firstComputer.room.name,
                  computers: computersList
                } as Room;
                
                setRoom(roomData);
                localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
              }
            }
            
            // Lưu roomId vào localStorage
            localStorage.setItem('lastTeacherRoomId', roomId);
          } else {
            toast.error(response.message || 'Failed to fetch room data');
          }
        } else {
          // Sử dụng dữ liệu từ cache
          const parsedComputers = JSON.parse(cachedComputers) as Computer[];
          setComputers(parsedComputers);
          
          if (cachedTeacherComputer) {
            setTeacherComputer(JSON.parse(cachedTeacherComputer) as Computer);
          } else {
            // Nếu không có teacher computer trong cache, tìm lại
            const teacherComputerName = `PC-${roomId}-1`;
            const foundTeacherComputer = parsedComputers.find(
              comp => comp.name === teacherComputerName
            );
            
            if (foundTeacherComputer) {
              setTeacherComputer(foundTeacherComputer);
              localStorage.setItem(`teacherComputer_${roomId}`, JSON.stringify(foundTeacherComputer));
            } else if (parsedComputers.length > 0) {
              setTeacherComputer(parsedComputers[0]);
              localStorage.setItem(`teacherComputer_${roomId}`, JSON.stringify(parsedComputers[0]));
            }
          }
          
          const cachedRoom = localStorage.getItem(`room_${roomId}`);
          if (cachedRoom) {
            setRoom(JSON.parse(cachedRoom) as Room);
          }
        }
      } catch (error: any) {
        console.error('Error fetching computers data:', error);
        toast.error(error.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [roomId, token]);

  const getStatusColor = (status: string) => {
    const colors = {
      'OPERATIONAL': 'bg-green-100 text-green-800',
      'IN_USE': 'bg-blue-100 text-blue-800',
      'MAINTENANCE': 'bg-amber-100 text-amber-800',
      'OFFLINE': 'bg-red-100 text-red-800',
    };
    
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getFileStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
    };
    
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleOpenUploadDialog = async (computer: Computer) => {
    setSelectedComputer(computer);
    setOpenUploadDialog(true);
    setFile(null);
    setNotes('');
    await fetchFileTransfers(computer.id);
  };

  const fetchFileTransfers = async (computerId: number) => {
    if (!token) return;
    
    try {
      setFileTransfersLoading(true);
      const response = await apiRequest<{
        success: boolean;
        message: string;
        transfers: FileTransfer[];
      }>('GET', `/computers/${computerId}/file-transfers`);
      
      if (response.success) {
        setFileTransfers(response.data.transfers || []);
      } else {
        toast.error(response.message || 'Failed to fetch file transfer history');
      }
    } catch (error: any) {
      console.error('Error fetching file transfers:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setFileTransfersLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    // Log thông tin trước khi upload
    
    if (!selectedComputer || !file || !token || !teacherComputer) {
      console.error('Missing required data:', {
        hasSelectedComputer: !!selectedComputer,
        hasFile: !!file,
        hasToken: !!token,
        hasTeacherComputer: !!teacherComputer
      });
      toast.error('Missing required information for upload');
      return;
    }
    
    try {
      setUploadLoading(true);
      
      // Tạo FormData để gửi file multipart/form-data
      const formData = new FormData();
      
      // Thêm file vào formData
      formData.append('file', file);
      
      // Thêm targetComputerIds (ID máy tính của sinh viên)
      formData.append('targetComputerIds', String(selectedComputer.id));
      
      // Thêm sourceId (ID máy tính của giáo viên)
      formData.append('sourceId', String(teacherComputer.id));
      
      // Thêm notes (ghi chú về file)
      formData.append('notes', notes);
      
      // Log FormData entries
      
      // Gửi request
      const response = await apiRequest('POST', '/file-transfers/send', {
        data: formData,
      });
      
      
      if (response.success) {
        toast.success('File uploaded successfully');
        setFile(null);
        setNotes('');
        // Cập nhật danh sách file transfers
        await fetchFileTransfers(selectedComputer.id);
      } else {
        toast.error(response.message || 'Failed to upload file');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'An error occurred while uploading file');
    } finally {
      setUploadLoading(false);
    }
  };


  // Thêm states để quản lý bulk upload
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkNotes, setBulkNotes] = useState('');
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState<{success: number, failed: number}>({success: 0, failed: 0});
  const [showBulkResults, setShowBulkResults] = useState(false);

  // Hàm xử lý khi chọn file cho bulk upload
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBulkFile(e.target.files[0]);
    }
  };

  // Hàm xử lý khi upload file cho tất cả máy tính (Gửi đồng thời)
  const handleBulkUpload = async () => {
    if (!bulkFile || !token || !teacherComputer) {
      toast.error('Please select a file and ensure you are logged in');
      return;
    }
    
    try {
      setIsBulkUploading(true);
      setBulkProgress(0);
      setBulkResults({success: 0, failed: 0});
      setShowBulkResults(false);
      
      // Lấy danh sách tất cả các máy tính (ngoại trừ máy tính của giáo viên)
      const targetComputers = computers.filter(comp => comp.id !== teacherComputer.id);
      
      toast.info(`Sending file to ${targetComputers.length} computers simultaneously...`);
      
      // Tạo mảng các promises để upload đồng thời
      const uploadPromises = targetComputers.map(computer => {
        const formData = new FormData();
        formData.append('file', bulkFile);
        formData.append('targetComputerIds', String(computer.id));
        formData.append('sourceId', String(teacherComputer.id));
        formData.append('notes', bulkNotes || `Bulk upload to all students - ${new Date().toLocaleString()}`);
        
        
        // Trả về promise cho mỗi request upload
        return apiRequest('POST', '/file-transfers/send', {
          data: formData,
        }).then(response => ({
          computer,
          success: response.success,
          message: response.message
        })).catch(error => ({
          computer,
          success: false,
          message: error.message || 'Unknown error'
        }));
      });
      
      // Hiển thị tiến trình
      setBulkProgress(30); // Giả lập tiến trình để người dùng thấy hoạt động
      
      // Gửi tất cả requests cùng lúc
      const results = await Promise.all(uploadPromises);
      
      // Cập nhật tiến trình
      setBulkProgress(100);
      
      // Đếm số lượng thành công và thất bại
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      
      // Cập nhật kết quả
      setBulkResults({
        success: successCount,
        failed: failedCount
      });
      
      // Hiển thị chi tiết trong console
      
      // Hiển thị kết quả
      setShowBulkResults(true);
      
      // Hiển thị thông báo tổng kết
      if (failedCount === 0) {
        toast.success(`File uploaded successfully to all ${successCount} computers`);
      } else {
        toast.warning(`Upload completed. Success: ${successCount}, Failed: ${failedCount}`);
      }
    } catch (error: any) {
      console.error('Error in bulk upload:', error);
      toast.error(error.message || 'An error occurred during bulk upload');
    } finally {
      setIsBulkUploading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{room?.name || 'Loading room...'}</h1>
        <p className="text-muted-foreground">
          {room ? `${room.computers?.length || 0} computers available` : 'Loading computers...'}
        </p>
      </div>
      
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Skeleton className="w-24 h-6" />
                  <Skeleton className="w-16 h-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-2/3 h-4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="w-full h-9" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {computers.map((computer) => (
            <Card key={computer.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    {computer.name}
                  </CardTitle>
                  <Badge className={getStatusColor(computer.status)}>
                    {computer.status}
                  </Badge>
                </div>
                <CardDescription>
                  IP: {computer.ipAddress} | MAC: {computer.macAddress}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processor:</span>
                    <span className="font-medium">{computer.specs?.processor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RAM:</span>
                    <span className="font-medium">{computer.specs?.ram || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="font-medium">{computer.specs?.storage || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleOpenUploadDialog(computer)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Upload File Dialog */}
      <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upload File to {selectedComputer?.name}</DialogTitle>
            <DialogDescription>
              Send learning materials or assignments to this computer.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="history">Transfer History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="py-4 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    onChange={handleFileChange} 
                    disabled={uploadLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Add description or instructions for the student..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={uploadLoading}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || uploadLoading}
                >
                  {uploadLoading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="py-4">
                <h3 className="mb-4 text-lg font-semibold">File Transfer History</h3>
                
                {fileTransfersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="w-full h-16" />
                    ))}
                  </div>
                ) : fileTransfers.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <FileUp className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No file transfers found for this computer.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {fileTransfers.map((transfer) => {
                      // Find specific status for this computer
                      const targetStatus = transfer.targets.find(
                        (t: any) => t.computerId === selectedComputer?.id
                      )?.status || transfer.status;
                      
                      return (
                        <div 
                          key={transfer.id} 
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div className="flex-1">
                            <div className="mb-1 font-medium">{transfer.originalName}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {format(new Date(transfer.transferredAt), 'MMM d, yyyy h:mm a')}
                              {transfer.notes && (
                                <span className="inline-flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  {transfer.notes.substring(0, 30)}
                                  {transfer.notes.length > 30 ? '...' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getFileStatusColor(targetStatus)}>
                              {targetStatus}
                            </Badge>
                            
                            {targetStatus === 'COMPLETED' && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            {targetStatus === 'REJECTED' && (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                            {targetStatus === 'PENDING' && (
                              <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Thêm UI cho bulk upload vào phần return JSX */}
      {/* Đặt đoạn code này gần phần cuối của component, trước khi đóng thẻ </div> cuối cùng */}
      <div className="p-4 mt-8 border rounded-lg bg-slate-50">
        <h2 className="mb-4 text-xl font-bold">Upload File to All Computers</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload to All Students
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload File to All Computers</DialogTitle>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bulkFile">Select File</Label>
                <Input
                  id="bulkFile"
                  type="file"
                  onChange={handleBulkFileChange}
                  disabled={isBulkUploading}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="bulkNotes">Notes</Label>
                <Textarea
                  id="bulkNotes"
                  placeholder="Add notes about this file"
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  disabled={isBulkUploading}
                />
              </div>
              
              {isBulkUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading to computers...</span>
                    <span>{bulkProgress}%</span>
                  </div>
                  <Progress value={bulkProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Success: {bulkResults.success}, Failed: {bulkResults.failed}
                  </p>
                </div>
              )}
              
              {showBulkResults && !isBulkUploading && (
                <div className="p-3 rounded bg-slate-100">
                  <h3 className="font-medium">Upload Results</h3>
                  <p className="text-sm">
                    <span className="text-green-600">Success: {bulkResults.success}</span>
                    {bulkResults.failed > 0 && (
                      <span className="ml-2 text-red-600">Failed: {bulkResults.failed}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button variant="outline" disabled={isBulkUploading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleBulkUpload}
                disabled={!bulkFile || isBulkUploading}
              >
                {isBulkUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to All
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}