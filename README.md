# Practice Room Management System

![Project Logo](./logo.png)

> Ứng dụng kiến trúc microservice và container hóa trong xây dựng và triển khai hệ thống quản lý Phòng thực hành tại trường học

## 1. Tổng Quan Dự Án

Dự án Practice Room Management System (PracticeRoomMS) nghiên cứu và ứng dụng kiến trúc microservice và container hóa trong việc xây dựng và triển khai hệ thống quản lý phòng thực hành tại trường học. Hệ thống được thiết kế để dễ dàng triển khai và mở rộng, tập trung vào việc quản lý thông tin phòng máy, trạng thái thiết bị, tình trạng phòng và tài khoản người dùng.

## 2. Kiến Trúc Hệ Thống

Hệ thống backend được xây dựng với kiến trúc microservice, bao gồm 4 thành phần chính:

```
┌──────────────────┐
│                  │
│    API Gateway   │────────────┐
│    (Port 3000)   │            │
└─────────-────────┘            │
                                │
                                ▼
        ┌────────────────┬────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ User Service │ │ Room Service │ │ Computer Svc │
│ (Port 3001)  │ │ (Port 3002)  │ │ (Port 3003)  │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 2.1. API Gateway (Port 3000)

- Điểm đầu vào duy nhất cho toàn bộ hệ thống
- Xác thực và phân quyền người dùng
- Định tuyến request đến các service thích hợp
- Cân bằng tải và quản lý timeout

### 2.2. User Service (Port 3001)

- Quản lý tài khoản người dùng (admin, giáo viên, sinh viên)
- Xác thực và cấp token
- Quản lý quyền và vai trò
- Lưu trữ thông tin cá nhân và liên hệ

### 2.3. Room Service (Port 3002)

- Quản lý danh sách phòng thực hành
- Theo dõi tình trạng phòng (đang sử dụng, bảo trì, trống)
- Lập lịch sử dụng phòng
- Thống kê tình hình sử dụng

### 2.4. Computer Service (Port 3003)

- Quản lý thông tin về máy tính và thiết bị
- Theo dõi trạng thái hoạt động của máy tính
- Ghi nhận lịch sử sử dụng thiết bị
- Hỗ trợ quản lý truyền gửi file

## 3. Chức Năng Chính

### 3.1. Quản Lý Phòng Thực Hành
- Thêm, sửa, xóa thông tin phòng
- Theo dõi tình trạng phòng (sẵn sàng, đang sử dụng, bảo trì)
- Lập lịch sử dụng phòng
- Thống kê tần suất sử dụng

### 3.2. Quản Lý Thiết Bị
- Theo dõi trạng thái thiết bị (hoạt động, không hoạt động)
- Quản lý thông tin về cấu hình máy tính
- Ghi nhận lịch sử bảo trì và sửa chữa
- Cảnh báo khi thiết bị gặp sự cố

### 3.3. Quản Lý Người Dùng
- Phân quyền người dùng (admin, giáo viên, sinh viên)
- Quản lý thông tin cá nhân
- Theo dõi lịch sử sử dụng phòng và thiết bị

### 3.4. Ứng Dụng Hỗ Trợ
- Kết nối máy tính trong phòng thực hành với web
- Quản lý máy tính sinh viên đang sử dụng
- Hỗ trợ truyền gửi file giữa các máy
- Giám sát hoạt động máy tính từ xa

## 4. Công Nghệ Sử Dụng

### 4.1. Backend
- NestJS: Framework Node.js để xây dựng microservices
- TCP/Microservices: Giao thức giao tiếp giữa các service
- PostgreSQL: Cơ sở dữ liệu quan hệ
- Prisma: ORM để tương tác với database
- Jest: Framework kiểm thử

### 4.2. Frontend
- React: Thư viện UI
- TypeScript: Ngôn ngữ lập trình
- Mantine UI: Component library
- Vite: Công cụ xây dựng frontend hiện đại

### 4.3. DevOps
- Docker & Docker Compose: Container hóa và điều phối dịch vụ
- Nginx: Reverse proxy và cân bằng tải
- Redis: Cache và message broker

## 5. Cấu Trúc Dự Án

```
PracticeRoomMS/
├── backend-microservices/     # Backend microservices
│   ├── apps/
│   │   ├── api-gateway/       # API Gateway Service
│   │   ├── user-service/      # User Service
│   │   ├── room-service/      # Room Service
│   │   └── computer-service/  # Computer Service
│   ├── libs/
│       ├── contracts/         # Shared DTOs
│       └── prisma/            # Database schema and client
│   
│
├── frontend/                  # Frontend application
│   ├── src/
│   │   ├── api/               # API clients
│   │   ├── components/        # Shared components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── teacher/       # Teacher pages
│   │   │   └── student/       # Student pages
│   │   ├── stores/            # State management
│   │   └── types/             # TypeScript definitions
│   └── vite.config.ts         # Vite configuration
│
└── docker-compose.yml         # Main Docker Compose file
```

## 6. Cách Triển Khai

### 6.1. Yêu Cầu Hệ Thống
- Docker và Docker Compose
- Node.js (v18+) cho phát triển

### 6.2. Khởi Động Hệ Thống

```bash
# Clone repository
git clone https://github.com/DoNhatNam1/PracticeRoomMS.git
cd PracticeRoomMS

# Chạy toàn bộ hệ thống với Docker Compose
docker-compose up -d
```

Sau khi khởi động:
- Frontend sẽ có sẵn tại: http://localhost:4200
- API Gateway sẽ có sẵn tại: http://localhost:3000

### 6.3. Phát Triển

```bash
# Phát triển backend
cd backend-microservices
npm install
npm run start:dev

# Phát triển frontend
cd frontend
npm install
npm run dev
```

## 7. Kế Hoạch Phát Triển

### 7.1. Giai Đoạn 1: Xây Dựng Cơ Sở Hạ Tầng
- Thiết lập kiến trúc microservice
- Container hóa các dịch vụ với Docker
- Triển khai API Gateway

### 7.2. Giai Đoạn 2: Phát Triển Chức Năng Cốt Lõi
- Phát triển các dịch vụ quản lý phòng, thiết bị và người dùng
- Xây dựng giao diện người dùng web

### 7.3. Giai Đoạn 3: Phát Triển Ứng Dụng Hỗ Trợ
- Xây dựng ứng dụng kết nối máy tính trong phòng
- Phát triển tính năng truyền gửi file và giám sát từ xa

### 7.4. Giai Đoạn 4: Tối Ưu Hóa và Mở Rộng
- Tối ưu hóa hiệu suất hệ thống
- Thêm tính năng báo cáo và thống kê nâng cao
- Mở rộng khả năng tích hợp với các hệ thống khác

## 8. Hướng Dẫn Demo

Tham khảo [Hướng dẫn demo](demo_project.md) để hiểu cách trình diễn các tính năng của hệ thống.

## 9. Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp cho dự án. Vui lòng xem [hướng dẫn đóng góp](CONTRIBUTING.md) để biết thêm chi tiết.

## 10. Giấy Phép

[MIT](LICENSE)
