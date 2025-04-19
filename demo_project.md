# **Hướng dẫn Demo Dự Án Quản lý Phòng Thực hành**

## **1. Mục tiêu của Demo**
Chứng minh rằng hệ thống hoạt động theo kiến trúc microservices trên môi trường Docker Swarm, với các dịch vụ phân tán và nhân rộng trên nhiều node, có khả năng giao tiếp thông qua NATS messaging, và quản lý phòng thực hành hiệu quả.

---

## **2. Chuẩn bị Môi trường**
### **Công cụ cần thiết:**
- **VirtualBox** (tạo máy ảo)
- **Vagrant** (quản lý máy ảo)
- **Git** (clone repository)
- **Postman** (kiểm tra API)
- **Browser** (truy cập frontend)

1. Khởi tạo các máy ảo bằng Vagrant:
   ```bash
   cd vagrant
   vagrant up
   ```
   Lệnh này sẽ tạo 4 máy ảo:
   - 1 Manager node
   - 3 Worker nodes

2. Kiểm tra các máy ảo đã được tạo:
   ```bash
   vagrant status
   ```

---

## **3. Triển khai Hệ thống trên Docker Swarm**

### **Bước 1: SSH vào Manager Node**
```bash
vagrant ssh manager
```

### **Bước 2: Kiểm tra trạng thái Swarm Cluster**
```bash
docker node ls
```
Bạn sẽ thấy danh sách 4 nodes (1 manager và 3 workers).

### **Bước 3: Triển khai Stack**
```bash
cd /home/vagrant/PracticeRoomMS
docker stack deploy -c docker-compose.yml practice-room
```

### **Bước 4: Kiểm tra các service đang chạy**
```bash
docker service ls
```
Kết quả mong muốn:
```
ID            NAME                      REPLICAS       IMAGE                        PORTS
abcd1234ef    practice-room_frontend    1/1            my-frontend-image:latest     *:80->80/tcp
abcd5678gh    practice-room_api-gateway 1/1            my-api-gateway-image:latest  *:3100->3000/tcp
abcd9101ij    practice-room_user-service 2/2           my-user-service-image:latest
abcd1112kl    practice-room_room-service 1/1           my-room-service-image:latest
abcd1314mn    practice-room_computer-service 3/3       my-computer-service-image:latest
abcd1516op    practice-room_nats        1/1            nats:latest                  *:4222->4222/tcp,*:8222->8222/tcp
```

### **Bước 5: Kiểm tra phân bố các container**
```bash
docker stack ps practice-room
```
Kết quả này sẽ hiển thị các container đang chạy trên những node nào, giúp xác minh rằng các service được phân bố đúng theo cấu hình (frontend và API gateway trên manager, các service khác trên các worker).

---

## **4. Demo Các Tính Năng**

### **Bước 1: Truy cập trang Welcome**
Trên máy host, mở trình duyệt và truy cập:
```
http://192.168.56.23
```
Trang Welcome cho phép chọn vai trò: Admin, Teacher hoặc Student.

### **Bước 2: Demo Admin Role**
1. Chọn Admin và đăng nhập với thông tin:
   - Username: admin
   - Password: admin123

2. Từ dashboard, thực hiện các tác vụ quản trị:
   - Tạo tài khoản giáo viên mới
   - Thêm phòng thực hành mới
   - Quản lý cấu hình máy tính

### **Bước 3: Demo Teacher Role**
1. Chọn Teacher
2. Xem danh sách phòng thực hành
3. Chọn một phòng và đăng nhập với thông tin:
   - Username: teacher
   - Password: teacher123
   
4. Từ dashboard giáo viên:
   - Đặt phòng thực hành
   - Tạo bài thực hành
   - Gửi file cho sinh viên

### **Bước 4: Demo Student Role**
1. Chọn Student
2. Xem danh sách phòng thực hành
3. Chọn một phòng, sau đó chọn một máy tính
4. Đăng nhập với thông tin:
   - Username: student
   - Password: student123
   
5. Từ dashboard sinh viên:
   - Xem các bài thực hành
   - Thực hiện bài tập
   - Xem file từ giáo viên

### **Bước 5: Demo Giao tiếp giữa các Microservices**
Khi gửi file từ giáo viên đến sinh viên:
1. Teacher gửi file qua giao diện
2. Sử dụng Wireshark hoặc log để theo dõi:
   - API Gateway nhận request
   - NATS phân phối thông báo cho các service
   - Computer Service xử lý file transfer
   - Máy tính sinh viên nhận file

---

## **5. Kiểm tra Khả năng Chịu Lỗi**

### **Mô phỏng lỗi Worker Node**
```bash
vagrant ssh manager
docker node update --availability drain worker2
```

Kiểm tra các service có tự động chuyển sang node khác không:
```bash
docker service ls
docker stack ps practice-room
```

### **Khôi phục Worker Node**
```bash
docker node update --availability active worker2
```

---

## **6. Giám Sát Hệ Thống**

### **Kiểm tra Logs**
```bash
docker service logs practice-room_api-gateway
docker service logs practice-room_user-service
```

### **Kiểm tra NATS**
Truy cập giao diện NATS:
```
http://192.168.56.23:8222
```

---

## **7. Kết luận**
Sau khi hoàn tất demo, bạn đã chứng minh rằng:
✅ Hệ thống sử dụng **Microservices** với Docker Swarm
✅ Các dịch vụ được phân bố và nhân rộng trên nhiều node
✅ NATS giúp các service giao tiếp hiệu quả
✅ Hệ thống có khả năng chịu lỗi và tự phục hồi
✅ Admin, Teacher và Student có thể tương tác với hệ thống theo vai trò của mình

Để dừng demo:
```bash
docker stack rm practice-room
vagrant halt
```

Để xóa hoàn toàn môi trường:
```bash
vagrant destroy -f
```

