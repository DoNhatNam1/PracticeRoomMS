# Hệ Thống Quản Lý Phòng Thực Hành - Kiến Trúc Microservice

## Tổng Quan Dự Án

Dự án này nghiên cứu và ứng dụng kiến trúc microservice và container hóa trong việc xây dựng và triển khai hệ thống quản lý phòng thực hành tại trường học. Hệ thống được thiết kế để dễ dàng triển khai và mở rộng, tập trung vào việc quản lý thông tin phòng máy, trạng thái thiết bị, tình trạng phòng và tài khoản người dùng.

## Mục Tiêu Dự Án

- Nghiên cứu và áp dụng kiến trúc microservice trong phát triển phần mềm
- Sử dụng container hóa (Docker) để triển khai ứng dụng một cách linh hoạt
- Xây dựng hệ thống web quản lý phòng thực hành
- Phát triển ứng dụng hỗ trợ kết nối máy tính trong phòng thực hành
- Rèn luyện kỹ năng phân tích thiết kế hệ thống thông tin và làm việc nhóm

## Kiến Trúc Hệ Thống

Hệ thống backend được xây dựng với kiến trúc microservice, bao gồm 4 thành phần chính:

```
┌──────────────────┐
│                  │
│    API Gateway   │────────────┐
│    (Port 3000)   │            │
└─────────┬────────┘            │
          │                     │
          │                     │
┌─────────┼─────────┬───────────┼──────────┐
│         │         │           │          │
▼         ▼         ▼           ▼          │
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ User Service │ │ Room Service │ │ Computer Svc │
│ (Port 3001)  │ │ (Port 3002)  │ │ (Port 3003)  │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 1. API Gateway (Port 3000)

API Gateway là điểm vào duy nhất cho tất cả các yêu cầu từ client, chịu trách nhiệm:
- Định tuyến yêu cầu đến microservice phù hợp
- Xác thực và phân quyền người dùng
- Cung cấp một giao diện API thống nhất cho client

### 2. User Service (Port 3001)

Dịch vụ quản lý thông tin người dùng:
- Quản lý tài khoản (sinh viên, giảng viên, quản trị viên)
- Xác thực và phân quyền
- Lưu trữ thông tin cá nhân và quyền truy cập

### 3. Room Service (Port 3002)

Dịch vụ quản lý thông tin phòng thực hành:
- Quản lý danh sách phòng thực hành
- Theo dõi tình trạng phòng (đang sử dụng, bảo trì, trống)
- Lập lịch sử dụng phòng
- Thống kê tình hình sử dụng

### 4. Computer Service (Port 3003)

Dịch vụ quản lý máy tính trong phòng thực hành:
- Quản lý thông tin về máy tính và thiết bị
- Theo dõi trạng thái hoạt động của máy tính
- Ghi nhận lịch sử sử dụng thiết bị
- Hỗ trợ quản lý truyền gửi file

## Chức Năng Chính

### Quản Lý Phòng Thực Hành
- Thêm, sửa, xóa thông tin phòng
- Theo dõi tình trạng phòng (sẵn sàng, đang sử dụng, bảo trì)
- Lập lịch sử dụng phòng
- Thống kê tần suất sử dụng

### Quản Lý Thiết Bị
- Theo dõi trạng thái thiết bị (hoạt động, không hoạt động)
- Quản lý thông tin về cấu hình máy tính
- Ghi nhận lịch sử bảo trì và sửa chữa
- Cảnh báo khi thiết bị gặp sự cố

### Quản Lý Người Dùng
- Phân quyền người dùng (admin, giáo viên, sinh viên)
- Quản lý thông tin cá nhân
- Theo dõi lịch sử sử dụng phòng và thiết bị

### Ứng Dụng Hỗ Trợ
- Kết nối máy tính trong phòng thực hành với web
- Quản lý máy tính sinh viên đang sử dụng
- Hỗ trợ truyền gửi file giữa các máy
- Giám sát hoạt động máy tính từ xa

## Công Nghệ Sử Dụng

### Backend
- NestJS: Framework Node.js để xây dựng microservices
- TCP/Microservices: Giao thức giao tiếp giữa các service


### Frontend
- Vite: Công cụ xây dựng frontend hiện đại

### DevOps
- Docker & Docker Compose: Container hóa và điều phối dịch vụ
- Nginx: Reverse proxy và cân bằng tải

## Cách Triển Khai

### Yêu Cầu Hệ Thống
- Docker và Docker Compose
- Node.js (v18+) cho phát triển

### Khởi Động Dịch Vụ Backend

```bash
# Clone repository
git clone https://github.com/your-username/PracticeRoomMS.git
cd PracticeRoomMS/backend-microservices

# Chạy toàn bộ hệ thống với Docker Compose
docker-compose up -d
```

API Gateway sẽ có sẵn tại http://localhost:3000

## Cấu Trúc Dự Án

```
backend-microservices/
├── apps/
│   ├── api-gateway/         # API Gateway Service
│   ├── users/               # User Service
│   ├── rooms/               # Room Service
│   └── computers/           # Computer Service
├── libs/
│   └── contracts/           # Shared DTOs
└── docker-compose.yml       # Cấu hình Docker Compose
```

## Kế Hoạch Phát Triển

### Giai Đoạn 1: Xây Dựng Cơ Sở Hạ Tầng
- Thiết lập kiến trúc microservice
- Container hóa các dịch vụ với Docker
- Triển khai API Gateway

### Giai Đoạn 2: Phát Triển Chức Năng Cốt Lõi
- Phát triển các dịch vụ quản lý phòng, thiết bị và người dùng
- Xây dựng giao diện người dùng web

### Giai Đoạn 3: Phát Triển Ứng Dụng Hỗ Trợ
- Xây dựng ứng dụng kết nối máy tính trong phòng
- Phát triển tính năng truyền gửi file và giám sát từ xa

### Giai Đoạn 4: Tối Ưu Hóa và Mở Rộng
- Tối ưu hóa hiệu suất hệ thống
- Thêm tính năng báo cáo và thống kê nâng cao
- Mở rộng khả năng tích hợp với các hệ thống khác

## Giấy Phép

[MIT](LICENSE)