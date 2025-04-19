# Cấu Trúc Thư Mục Diagram cho Dự Án PracticeRoomMS

Thư mục này chứa tất cả các diagram phục vụ cho việc phân tích, thiết kế và tài liệu hóa dự án PracticeRoomMS. Cấu trúc được tổ chức theo loại diagram và mục đích sử dụng.

```
c:\Nam_Projects\PracticeRoomMS\diagrams\
├── source\                   # Thư mục chứa các file nguồn diagram
│   ├── architecture\             # Sơ đồ kiến trúc hệ thống
│   │   ├── system-overview.puml          # Tổng quan hệ thống
│   │   ├── api-gateway-architecture.puml # Kiến trúc API Gateway
│   │   ├── microservice-communication.puml # Giao tiếp giữa các microservice
│   │
│   ├── sequence\                 # Sơ đồ trình tự
│   │   ├── authentication-flow.puml       # Luồng xác thực
│   │   ├── room-booking-flow.puml         # Luồng đặt phòng
│   │   ├── file-transfer-flow.puml        # Luồng truyền file
│   │   ├── messagepattern-flow.puml       # Luồng MessagePattern
│   │   ├── eventpattern-flow.puml         # Luồng EventPattern
│   │
│   ├── use_case\                 # Sơ đồ use case
│   │   ├── admin-use-cases.puml           # Use case của admin
│   │   ├── teacher-use-cases.puml         # Use case của giáo viên
│   │   ├── student-use-cases.puml         # Use case của sinh viên
│   │
│   ├── class\                    # Sơ đồ lớp
│   │   ├── domain-model.puml              # Mô hình miền
│   │   ├── service-classes.puml           # Các lớp service
│   │   ├── dto-classes.puml               # Các lớp DTO
│   │
│   ├── deployment\               # Sơ đồ triển khai
│   │   ├── production-deployment.puml     # Môi trường production
│   │   ├── development-deployment.puml    # Môi trường development
│   │
│   ├── network\                  # Sơ đồ mạng (nwdiag)
│   │   ├── network-topology.puml          # Topo mạng hệ thống
│   │   ├── container-network.puml         # Mạng giữa các container
│   │
│   ├── er\                       # Sơ đồ Entity Relationship
│   │   ├── database-schema.puml           # Sơ đồ schema database
│   │   ├── entity-relationships.puml      # Quan hệ giữa các entity
│   │
│   └── activity\                 # Sơ đồ hoạt động
│       ├── room-booking-activity.puml     # Hoạt động đặt phòng
│       ├── user-registration.puml         # Hoạt động đăng ký người dùng
│       ├── file-transfer-activity.puml    # Hoạt động truyền file
│
├── images\                     # Thư mục chứa hình ảnh diagram
│   ├── architecture\             # Hình ảnh sơ đồ kiến trúc
│   ├── sequence\                 # Hình ảnh sơ đồ trình tự
│   ├── use_case\                 # Hình ảnh sơ đồ use case
│   ├── class\                    # Hình ảnh sơ đồ lớp
│   ├── deployment\               # Hình ảnh sơ đồ triển khai
│   ├── network\                  # Hình ảnh sơ đồ mạng
│   ├── er\                       # Hình ảnh sơ đồ ER
│   └── activity\                 # Hình ảnh sơ đồ hoạt động
```

## Hướng dẫn sử dụng

### Tổ chức file
- Thư mục **source** chứa tất cả mã nguồn PlantUML
- Thư mục **images** chứa các hình ảnh được xuất ra từ mã nguồn
- Mỗi file .puml có thể có file notes.txt tương ứng để hướng dẫn cách chia nhỏ diagram

### Quy trình làm việc
1. Sử dụng VSCode với extension PlantUML để chỉnh sửa và xem trước
2. Tham khảo file notes.txt (nếu có) để biết cách chia nhỏ diagram khi cần
3. Chỉnh sửa các file .puml trong thư mục source
4. Xuất hình ảnh vào thư mục images tương ứng, có thể chia nhỏ theo hướng dẫn
5. Sử dụng hình ảnh trong tài liệu kỹ thuật và báo cáo dự án
