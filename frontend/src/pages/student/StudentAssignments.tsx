import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, Check, X, BookOpen, FileQuestion } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { apiRequest } from '@/api/base';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { tokenService } from '@/services/tokenService';

export default function StudentAssignments() {
  const { computerId } = useParams<{ roomId: string; computerId: string }>();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [fileTransfers, setFileTransfers] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  // Thêm state theo dõi trạng thái kết nối
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');

  // Cập nhật useEffect cho socket connection
  useEffect(() => {
    
    if (!token || !computerId) {
      return;
    }
    
    const API_URL = import.meta.env.VITE_API_URL || '';
    
    // Xử lý URL cho socket server
    const baseUrl = API_URL.replace(/\/api$/, '');
    
    // Đảm bảo token có định dạng Bearer
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Sửa đường dẫn kết nối Socket.io
    socketRef.current = io(baseUrl, {
      auth: { token: authToken },
      query: { computerId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io',
      transports: ['polling', 'websocket'], // Đặt polling trước để ưu tiên
      timeout: 10000
    });
    
    // Đăng ký vào namespace file-transfers sau khi kết nối
    socketRef.current.on('connect', () => {
      // Join room cho file transfers
      socketRef.current?.emit('join:file-transfers', { computerId });
      
      setConnectionStatus('connected');
      toast.success('Connected to file transfer service');
      
      // Tải danh sách file đang chờ khi kết nối thành công
      loadExistingFiles();
    });
    
    socketRef.current.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      toast.error(`Connection error: ${err.message}`);
      setConnectionStatus('disconnected');
    });
    
    socketRef.current.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      
      if (reason === 'io server disconnect') {
        // Server đã chủ động disconnect socket này
        toast.error('Disconnected from server. Trying to reconnect...');
        socketRef.current?.connect();
      }
      
      // Hiển thị toast thông báo ngắn
      toast.error('Connection lost. Waiting to reconnect...');
    });
    
    socketRef.current.on('reconnecting', (attemptNumber) => {
      setConnectionStatus('reconnecting');
      
      if (attemptNumber === 1) {
        toast.info('Reconnecting to server...');
      }
    });
    
    socketRef.current.on('reconnect', () => {
      setConnectionStatus('connected');
      toast.success('Reconnected successfully!');
      
      // Khi reconnect thành công, tự động cập nhật lại danh sách
      loadExistingFiles();
    });
    
    socketRef.current.on('reconnect_error', (error) => {
      console.error('🔄❌ Reconnect error:', error);
      toast.error('Failed to reconnect. Please refresh the page.');
    });
    
    socketRef.current.on('reconnect_failed', () => {
      console.error('🔄❌ All reconnect attempts failed');
      toast.error('Could not reconnect. Please refresh the page.');
    });
    
    socketRef.current.on('file:new', (data) => {
      toast.success(`New file received: ${data.originalName || data.fileName}`);
      
      // Thêm file mới vào danh sách
      setFileTransfers(prev => {
        const newList = [data, ...prev];
        return newList.sort((a, b) => 
          new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime()
        );
      });
    });
    
    socketRef.current.on('file:statusUpdate', (data) => {
      toast.info(`File status updated: ${data.id} → ${data.status}`);
      
      // Cập nhật trạng thái file trong danh sách
      setFileTransfers(prev => prev.map(file => 
        file.id === data.id ? { ...file, status: data.status } : file
      ));
    });
    
    // Cleanup khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, computerId]);
  
  // Hàm tải danh sách file hiện có - giống như trong index.html
  const loadExistingFiles = async () => {
    if (!token || !computerId) return;
    
    try {
      setLoading(true);
            
      const response = await apiRequest<any>('GET', `/computers/${computerId}/file-transfers?status=PENDING`);
      
      if (response?.success && response.data.transfers) {
        
        // Sắp xếp theo ngày gần nhất
        const sortedTransfers = response.data.transfers.sort((a: any, b: any) => 
          new Date(b.transferredAt).getTime() - new Date(a.transferredAt).getTime()
        );
        
        setFileTransfers(sortedTransfers);
      } else {
      }
    } catch (error) {
      console.error('❌ Error fetching file transfers:', error);
      toast.error('Failed to load learning materials');
    } finally {
      setLoading(false);
    }
  };
  
  // Cập nhật hàm handleDownload không sử dụng token
  const handleDownload = async (fileId: number) => {
    try {
      setLoading(true);
      
      // Lấy API_URL
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      
      // Lấy token từ cookie hoặc localStorage
      const authToken = tokenService.getAccessToken();
      
      if (!authToken) {
        toast.error("Authentication token not found");
        return;
      }
      
      // Chuẩn bị Authorization header
      const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      
      // Sử dụng fetch API để download file với token trong header
      const response = await fetch(
        `${API_URL}/file-transfers/${fileId}/download?computerId=${computerId}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': token
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      // Lấy tên file từ header hoặc dùng tên mặc định
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `file-${fileId}`;
      
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      // Convert response về blob
      const blob = await response.blob();
      
      // Tạo object URL từ blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Tạo link và trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      
      toast.success('File download started');
      
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Failed to download file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async (fileTransferId: number) => {
    try {
      // Lấy token từ cookie
      const cookieToken = Cookies.get('accessToken');
      
      if (!cookieToken) {
        toast.error("Authentication token not found");
        return;
      }
      
      // Chuẩn bị token đúng format
      const authToken = cookieToken.startsWith('Bearer ') 
        ? cookieToken 
        : `Bearer ${cookieToken}`;
      
      // Log thông tin request để debug
      console.log('Rejecting file transfer:', {
        url: `${import.meta.env.VITE_API_URL}/file-transfers/${fileTransferId}/status`,
        computerId,
        fileTransferId
      });
      
      // Sử dụng apiRequest thay vì fetch trực tiếp
      const updateResponse = await apiRequest('PUT', `/file-transfers/${fileTransferId}/status`, {
        headers: {
          'Authorization': authToken
        },
        data: {
          status: 'FAILED',
          targetComputerId: Number(computerId),
          notes: 'File rejected by student'
        }
      });
      
      // Log response để debug
      
      if (updateResponse?.success) {
        toast.success('File rejected successfully');
        
        // Xóa file đã reject khỏi danh sách hiển thị ngay lập tức
        setFileTransfers(prev => prev.filter(file => file.id !== fileTransferId));
        
        // Hiệu ứng xóa đẹp hơn (optional)
        // const fileElement = document.getElementById(`file-${fileTransferId}`);
        // if (fileElement) {
        //   fileElement.classList.add('opacity-0', 'scale-95');
        //   setTimeout(() => {
        //     setFileTransfers(prev => prev.filter(file => file.id !== fileTransferId));
        //   }, 300);
        // } else {
        //   setFileTransfers(prev => prev.filter(file => file.id !== fileTransferId));
        // }
      } else {
        throw new Error(updateResponse?.message || 'Failed to update file transfer status');
      }
    } catch (error: any) {
      console.error('Error rejecting file:', error);
      toast.error(`Failed to reject file: ${error.message || 'Unknown error'}`);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
    };
    
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Phân loại file để hiển thị icon và badge phù hợp
  const isAssignment = (file: any) => {
    // Kiểm tra dựa vào tag hoặc tagId nếu có
    if (file.tags && file.tags.some((tag: any) => 
      tag.name?.toLowerCase().includes('assignment') || 
      tag.name?.toLowerCase().includes('homework'))) {
      return true;
    }
    
    // Kiểm tra dựa vào notes
    if (file.notes && (
      file.notes.toLowerCase().includes('assignment') || 
      file.notes.toLowerCase().includes('homework') ||
      file.notes.toLowerCase().includes('exercise')
    )) {
      return true;
    }
    
    // Kiểm tra dựa vào tên file
    const fileExt = file.originalName?.split('.').pop()?.toLowerCase();
    if (fileExt && ['docx', 'pdf', 'zip', 'rar'].includes(fileExt)) {
      return true;
    }
    
    return false;
  };
  
  // Tạo icon phù hợp với loại file
  const getFileIcon = (file: any) => {
    const fileExt = file.originalName?.split('.').pop()?.toLowerCase();
    
    if (isAssignment(file)) {
      return <FileQuestion className="w-5 h-5 text-blue-500" />;
    }
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
      return <BookOpen className="w-5 h-5 text-purple-500" />;
    }
    
    if (['mp3', 'wav', 'midi'].includes(fileExt)) {
      return <BookOpen className="w-5 h-5 text-orange-500" />;
    }
    
    return <BookOpen className="w-5 h-5 text-green-500" />;
  };
  
  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Learning Materials</h1>
        
        <div className="flex items-center gap-2">
          {/* Hiển thị trạng thái kết nối */}
          <div className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'reconnecting' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'reconnecting' ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}></div>
            <span>
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'reconnecting' ? 'Reconnecting...' : 
               'Disconnected'}
            </span>
          </div>
          
          {/* Nút refresh thủ công */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadExistingFiles}
            disabled={loading || connectionStatus === 'disconnected'}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      {/* Hiển thị thông báo khi đang reconnecting */}
      {connectionStatus === 'reconnecting' && (
        <div className="p-3 mb-4 text-yellow-800 border border-yellow-100 rounded-md bg-yellow-50">
          <p className="text-sm">
            Reconnecting to the server... Your connection will be restored automatically.
          </p>
        </div>
      )}
      
      {/* Hiển thị thông báo khi mất kết nối */}
      {connectionStatus === 'disconnected' && (
        <div className="p-3 mb-4 text-red-800 border border-red-100 rounded-md bg-red-50">
          <p className="flex items-center justify-between text-sm">
            <span>Connection to server lost. Please wait for reconnection or refresh the page.</span>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </p>
        </div>
      )}
      
      {/* Nội dung file transfers như cũ */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
                <Skeleton className="h-3 w-[150px] mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-3 mb-2" />
                <Skeleton className="w-3/4 h-3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-[120px]" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : fileTransfers.length > 0 ? (
        <div className="space-y-4">
          {fileTransfers.map((file) => {
            // Tìm target cụ thể cho máy tính này
            const target = file.targets?.find((t: any) => 
              t.computerId === parseInt(computerId || '0'));
            
            const status = target ? target.status : file.status || 'UNKNOWN';
            const fileIsAssignment = isAssignment(file);
            
            return (
              <Card key={file.id} className={`overflow-hidden ${
                status === 'COMPLETED' ? 'border-green-200 bg-green-50' : 
                status === 'REJECTED' ? 'border-red-200 bg-red-50' : ''
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file)}
                      <CardTitle className="text-lg font-semibold">
                        {fileIsAssignment ? 'Assignment: ' : ''}{file.originalName}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={fileIsAssignment ? 
                        'bg-blue-100 text-blue-800 border-blue-200' : 
                        'bg-green-100 text-green-800 border-green-200'}>
                        {fileIsAssignment ? 'Assignment' : 'Material'}
                      </Badge>
                      <Badge className={getStatusBadge(status)}>
                        {status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    From: {file.user?.name || file.userName || 'Unknown'} • 
                    {format(new Date(file.transferredAt), ' MMM d, yyyy • h:mm a')} • 
                    {file.fileSize ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {file.notes || (fileIsAssignment ? 
                      'Complete this assignment and submit your work to your teacher' : 
                      'Learning material for your practice session')}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-gray-50">
                  {status === 'PENDING' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 text-red-600"
                        onClick={() => handleReject(file.id)}
                      >
                        <X size={16} />
                        Reject
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="gap-1"
                        onClick={() => handleDownload(file.id)}
                      >
                        <Download size={16} />
                        Download
                      </Button>
                    </>
                  )}
                  {status === 'COMPLETED' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1 text-green-600"
                      onClick={() => handleDownload(file.id)}
                    >
                      <Check size={16} />
                      Download Again
                    </Button>
                  )}
                  {status === 'REJECTED' && (
                    <span className="text-sm text-gray-500">
                      You rejected this file
                    </span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-12 h-12 mb-4 text-gray-300" />
          <h3 className="mb-2 text-xl font-medium">No Files Available</h3>
          <p className="max-w-md text-gray-500">
            Your teacher hasn't shared any learning materials or assignments with you yet.
            Check back later or ask your teacher for resources.
          </p>
        </div>
      )}
    </div>
  );
}