import { PrismaClient, RoomStatus, ComputerStatus } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/vi';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

// Hàm sinh ngày ngẫu nhiên trong khoảng thời gian
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Tạo thông tin cấu hình máy có liên quan đến âm nhạc/phòng thực hành
const computerSpecs = [
  {
    cpu: "Intel Core i7-11700K",
    ram: "32GB DDR4",
    storage: "1TB SSD",
    os: "Windows 10 Pro",
    audio: "Focusrite Scarlett 2i2",
    software: ["Ableton Live 11", "FL Studio 20", "Sibelius"],
    gpu: "NVIDIA RTX 3060",
    monitor: "27 inch Dell UltraSharp"
  },
  {
    cpu: "AMD Ryzen 9 5900X",
    ram: "64GB DDR4",
    storage: "2TB SSD",
    os: "Windows 11 Pro",
    audio: "Universal Audio Apollo Twin",
    software: ["Pro Tools", "Logic Pro X", "Finale"],
    gpu: "NVIDIA RTX 3080",
    monitor: "32 inch LG UltraFine"
  },
  {
    cpu: "Apple M1 Pro",
    ram: "16GB Unified",
    storage: "512GB SSD",
    os: "macOS Monterey",
    audio: "Native Instruments Komplete Audio 6",
    software: ["Logic Pro X", "GarageBand", "MuseScore"],
    gpu: "Integrated",
    monitor: "16 inch Retina Display"
  },
  {
    cpu: "Intel Core i5-10600K",
    ram: "16GB DDR4",
    storage: "512GB SSD + 1TB HDD",
    os: "Windows 10 Education",
    audio: "PreSonus AudioBox USB 96",
    software: ["Cubase Pro 11", "Dorico", "Audacity"],
    gpu: "NVIDIA GTX 1660 Super",
    monitor: "24 inch ASUS ProArt"
  },
  {
    cpu: "AMD Ryzen 7 5800X",
    ram: "32GB DDR4",
    storage: "1TB NVMe SSD",
    os: "Windows 10 Pro",
    audio: "Behringer UMC404HD",
    software: ["Reason 12", "Ableton Live 11", "Cakewalk"],
    gpu: "AMD Radeon RX 6700 XT",
    monitor: "27 inch BenQ PD2700U"
  }
];

async function main() {
  console.log('Bắt đầu seed dữ liệu...');

  // ---------------------------
  // Seed Activity data
  // ---------------------------
  console.log('Seed dữ liệu Activity...');

  // Xóa dữ liệu cũ nếu cần
  await prisma.activity.deleteMany({});

  // Tạo dữ liệu mẫu cho các hoạt động của người dùng
  const activityTypes = [
    { action: 'LOGIN', entityType: 'auth' },
    { action: 'LOGOUT', entityType: 'auth' },
    { action: 'CREATE_USER', entityType: 'user' },
    { action: 'UPDATE_USER', entityType: 'user' },
    { action: 'UPDATE_ROLE', entityType: 'user' },
    { action: 'UPDATE_STATUS', entityType: 'user' },
    { action: 'BOOK_ROOM', entityType: 'room' },
    { action: 'CANCEL_BOOKING', entityType: 'room' },
    { action: 'CHECK_IN', entityType: 'room' },
    { action: 'CHECK_OUT', entityType: 'room' },
    { action: 'COMPUTER_LOGIN', entityType: 'computer' },
    { action: 'COMPUTER_LOGOUT', entityType: 'computer' },
    { action: 'INSTALL_SOFTWARE', entityType: 'computer' },
    { action: 'UPDATE_HARDWARE', entityType: 'computer' },
    { action: 'REPORT_ISSUE', entityType: 'computer' },
    { action: 'MAINTENANCE', entityType: 'computer' }
  ];

  // Lấy các user từ database
  const users = await prisma.user.findMany({
    select: { id: true }
  });

  if (users.length === 0) {
    console.log('Không có user nào trong hệ thống. Hãy tạo user trước khi seed activity.');
    return;
  }

  // Lấy danh sách máy tính từ database
  const computers = await prisma.computer.findMany({
    select: { id: true, roomId: true, ipAddress: true }
  });

  // Tạo activities cho mỗi user
  const activities: {
    userId: number;
    action: string;
    entityType: string;
    entityId: number | null;
    details: object;
    ipAddress: string;
    createdAt: Date;
  }[] = [];

  for (const user of users) {
    // Tạo 5-15 hoạt động cho mỗi user
    const numActivities = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < numActivities; i++) {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      
      // Tạo entityId tùy thuộc vào entityType
      let entityId: number | null = null;
      let details = {};
      
      if (activityType.entityType === 'user') {
        entityId = users[Math.floor(Math.random() * users.length)].id;
        
        if (activityType.action === 'UPDATE_ROLE') {
          details = { role: ['USER', 'TEACHER', 'MANAGER', 'ADMIN'][Math.floor(Math.random() * 4)] };
        } else if (activityType.action === 'UPDATE_STATUS') {
          details = { isActive: Math.random() > 0.5 };
        } else {
          details = { 
            fullName: faker.person.fullName(),
            email: faker.internet.email()
          };
        }
      } else if (activityType.entityType === 'room') {
        entityId = Math.floor(Math.random() * 10) + 1;
        
        const startTime = randomDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );
        
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 3) + 1);
        
        // Đảm bảo dates là ISO strings
        details = {
          roomId: entityId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          purpose: faker.lorem.sentence(3)
        };
      } else if (activityType.entityType === 'auth') {
        details = {
          email: faker.internet.email(),
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent()
        };
      } else if (activityType.entityType === 'computer') {
        // Chọn ngẫu nhiên một máy tính thực tế từ danh sách
        const computer = computers.length > 0 
          ? computers[Math.floor(Math.random() * computers.length)]
          : { id: Math.floor(Math.random() * 10) + 1, roomId: 1, ipAddress: faker.internet.ip() };
        
        entityId = computer.id;
        
        // Tạo details tùy thuộc vào loại hoạt động
        if (activityType.action === 'INSTALL_SOFTWARE') {
          details = {
            computerId: computer.id,
            software: ["Ableton Live 11", "Pro Tools", "Sibelius"][Math.floor(Math.random() * 3)],
            version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
            installDate: new Date().toISOString()
          };
        } else if (activityType.action === 'REPORT_ISSUE') {
          details = {
            computerId: computer.id,
            issueType: ["Hardware", "Software", "Network", "Peripheral"][Math.floor(Math.random() * 4)],
            description: [
              "Loa không phát ra âm thanh",
              "Phần mềm Sibelius bị treo khi sử dụng",
              "Không kết nối được với card âm thanh",
              "Bàn phím MIDI không được nhận diện",
              "Màn hình hiển thị sai màu"
            ][Math.floor(Math.random() * 5)],
            severity: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)]
          };
        } else {
          details = {
            computerId: computer.id,
            timestamp: new Date().toISOString(),
            status: activityType.action
          };
        }

        // Tạo activity với IP lấy trực tiếp từ computer object
        activities.push({
          userId: user.id,
          action: activityType.action,
          entityType: activityType.entityType,
          entityId,
          details,
          ipAddress: computer.ipAddress ?? '', // Lấy trực tiếp từ computer hoặc sử dụng giá trị mặc định
          createdAt: new Date()
        });
      } else {
        // Xử lý các loại hoạt động không phải của computer
        activities.push({
          userId: user.id,
          action: activityType.action,
          entityType: activityType.entityType,
          entityId,
          details,
          ipAddress: faker.internet.ip(), // Chỉ dùng random IP cho non-computer
          createdAt: new Date()
        });
      }
    }
  }
  
  // Sửa phần createMany cho Activity
  await prisma.activity.createMany({
    data: activities.map(activity => {
      return {
        userId: activity.userId,
        action: activity.action, 
        entityType: activity.entityType,
        entityId: activity.entityId,
        details: activity.details, // Không cần JSON.stringify() ở đây
        ipAddress: activity.ipAddress,
        createdAt: activity.createdAt
      };
    })
  });
  
  console.log(`Đã tạo ${activities.length} bản ghi hoạt động`);

  // ---------------------------
  // Seed RoomUsage data
  // ---------------------------
  console.log('Seed dữ liệu RoomUsage...');

  // Kiểm tra xem có bảng Room không
  let hasRoomTable = true;
  try {
    const roomCount = await prisma.room.count();
    console.log(`Có ${roomCount} phòng trong database`);
  } catch (error) {
    console.log('Không tìm thấy bảng Room trong database');
    hasRoomTable = false;
  }

  // Nếu không có bảng Room, chỉ tạo Activity, không tạo RoomUsage
  if (!hasRoomTable) {
    console.log('Bỏ qua việc tạo RoomUsage do không tìm thấy bảng Room');
    console.log('Seed dữ liệu hoàn tất!');
    return;
  }

  // Xóa dữ liệu cũ nếu cần
  await prisma.roomUsage.deleteMany({});

  // Đầu tiên, tạo các phòng thực tế nếu chưa có
  let rooms = await prisma.room.findMany({
    select: { id: true }
  });

  // Nếu không có phòng nào, tạo một số phòng mẫu
  if (rooms.length === 0) {
    console.log('Không tìm thấy phòng nào, tạo một số phòng mẫu...');
    
    // Thử tạo với enum
    try {
      const roomData = [
        { name: 'Phòng Piano 1', location: 'Tầng 1', capacity: 2, status: RoomStatus.AVAILABLE },
        { name: 'Phòng Piano 2', location: 'Tầng 1', capacity: 2, status: RoomStatus.AVAILABLE },
        { name: 'Phòng Violin', location: 'Tầng 2', capacity: 4, status: RoomStatus.AVAILABLE },
        { name: 'Phòng Guitar', location: 'Tầng 2', capacity: 6, status: RoomStatus.AVAILABLE },
        { name: 'Phòng Nhạc Cụ Dân Tộc', location: 'Tầng 3', capacity: 10, status: RoomStatus.AVAILABLE }
      ];
      
      if (roomData.length > 0) {
        for (const room of roomData) {
          await prisma.room.create({
            data: {
              name: room.name,
              location: room.location,
              capacity: room.capacity,
              status: RoomStatus.AVAILABLE
            }
          });
        }
        console.log(`Đã tạo ${roomData.length} phòng mẫu`);
      }
    } catch (error) {
      console.log('Lỗi khi tạo phòng với enum, thử lại với string đã ép kiểu...');
      
      // Nếu có lỗi, thử lại với string trực tiếp
      const roomData = [
        { name: 'Phòng Piano 1', location: 'Tầng 1', capacity: 2, status: RoomStatus.AVAILABLE },
        { name: 'Phòng Piano 2', location: 'Tầng 1', capacity: 2, status: RoomStatus.AVAILABLE },
        { name: 'Phòng Violin', location: 'Tầng 2', capacity: 4, status: RoomStatus.AVAILABLE },
        { name: 'Phòng Guitar', location: 'Tầng 2', capacity: 6, status: RoomStatus.AVAILABLE },
        { name: 'Phòng Nhạc Cụ Dân Tộc', location: 'Tầng 3', capacity: 10, status: RoomStatus.AVAILABLE }
      ];
      
      if (roomData.length > 0) {
        for (const room of roomData) {
          await prisma.room.create({
            data: {
              name: room.name,
              location: room.location,
              capacity: room.capacity,
              status: RoomStatus.AVAILABLE
            }
          });
        }
        console.log(`Đã tạo ${roomData.length} phòng mẫu`);
      }
    }
    
    // Lấy lại danh sách phòng sau khi tạo
    rooms = await prisma.room.findMany({
      select: { id: true }
    });
    
    console.log(`Đã tạo ${rooms.length} phòng mẫu`);
  }

  // Tạo dữ liệu mẫu cho lịch sử sử dụng phòng
  const roomUsages: {
    userId: number;
    roomId: number;
    startTime: Date;
    endTime: Date;
    purpose: string;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];

  // Thay thế phần tạo purpose với dữ liệu hợp lý hơn
  const roomPurposes = [
    "Luyện tập cá nhân trước buổi biểu diễn",
    "Luyện tập nhóm cho bài tập môn nhạc cụ",
    "Thực hành bài giảng âm nhạc cơ bản",
    "Tập dượt cho hòa nhạc học kỳ",
    "Nghiên cứu và sáng tác nhạc",
    "Luyện tập kỹ thuật chơi piano nâng cao",
    "Học nhóm môn Lý thuyết âm nhạc",
    "Chuẩn bị bài thi thực hành cuối kỳ",
    "Dạy kèm nhạc cụ cho học sinh mới",
    "Lớp học đàn phụ đạo tăng cường",
    "Tập luyện cho cuộc thi tài năng âm nhạc",
    "Thực hành hòa âm và phối khí",
    "Quay video biểu diễn cho dự án cá nhân",
    "Buổi thực hành phương pháp sư phạm âm nhạc",
    "Luyện tập trước buổi thi thử"
  ];

  // Tạo roomUsage cho mỗi user
  for (const user of users) {
    // Tạo 1-3 lịch sử sử dụng phòng cho mỗi user
    const numRoomUsages = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numRoomUsages; i++) {
      // Chọn phòng ngẫu nhiên
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      
      // Tạo thời gian sử dụng ngẫu nhiên
      const startTime = randomDate(
        new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      );
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 3) + 1);
      
      const createdAt = new Date(startTime);
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 3));
      
      roomUsages.push({
        userId: user.id,
        roomId: room.id,
        startTime,
        endTime,
        // Chọn mục đích sử dụng phòng phù hợp từ danh sách
        purpose: roomPurposes[Math.floor(Math.random() * roomPurposes.length)],
        createdAt,
        updatedAt: createdAt
      });
    }
  }

  // Kiểm tra trước khi tạo
  if (roomUsages.length === 0) {
    console.log('Không có dữ liệu RoomUsage để tạo');
  } else {
    // Batch insert roomUsages
    await prisma.roomUsage.createMany({
      data: roomUsages
    });
    
    console.log(`Đã tạo ${roomUsages.length} bản ghi sử dụng phòng`);
  }

  // ---------------------------
  // Seed Computer data
  // ---------------------------
  console.log('Seed dữ liệu Computer và ComputerUsage...');

  // Kiểm tra xem có bảng Computer không
  let hasComputerTable = true;
  try {
    const computerCount = await prisma.computer.count();
    console.log(`Có ${computerCount} máy tính trong database`);
  } catch (error) {
    console.log('Không tìm thấy bảng Computer trong database');
    hasComputerTable = false;
  }

  // Nếu không có bảng Computer, bỏ qua phần này
  if (!hasComputerTable) {
    console.log('Bỏ qua việc tạo ComputerUsage do không tìm thấy bảng Computer');
    console.log('Seed dữ liệu hoàn tất!');
    return;
  }

  // Xóa dữ liệu cũ nếu cần
  await prisma.computerUsage.deleteMany({});

  // Tạo máy tính nếu chưa có
  let existingComputers = await prisma.computer.findMany({
    select: { id: true, roomId: true }
  });

  // Nếu không có máy tính nào, tạo một số máy tính mẫu cho mỗi phòng
  if (existingComputers.length === 0) {
    console.log('Không tìm thấy máy tính nào, tạo một số máy tính mẫu...');
    
    // Sửa định nghĩa kiểu dữ liệu computerData
    const computerData: {
      name: string;
      description: string;
      status: ComputerStatus;
      roomId: number;
      ipAddress: string; // Thêm trường ipAddress
      macAddress?: string; // Tùy chọn thêm macAddress
      specs: object | null;
      createdAt: Date;
      updatedAt: Date;
    }[] = [];
    
    for (const room of rooms) {
      const numComputers = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 1; i <= numComputers; i++) {
        // Tạo IP theo phòng và số thứ tự máy tính
        // Format: 192.168.[phòng].[số máy]
        const ipAddress = `192.168.${room.id}.${i + 10}`;
        // Hoặc dùng faker để tạo ngẫu nhiên: faker.internet.ip()
        
        // Tạo MAC Address (tùy chọn)
        const macAddress = faker.internet.mac();
        
        computerData.push({
          name: `PC-${room.id}-${i}`,
          description: `Máy tính ${i} của phòng ${room.id}`,
          status: ComputerStatus.OPERATIONAL,
          roomId: room.id,
          ipAddress, // IP tĩnh theo quy tắc phòng/máy
          macAddress, // Tùy chọn
          specs: computerSpecs[Math.floor(Math.random() * computerSpecs.length)], // Sửa phần tạo specs
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Kiểm tra và điều chỉnh giá trị specs nếu cần
    const preparedComputerData = computerData.map(computer => {
      // Tạo một bản sao để không ảnh hưởng đến dữ liệu gốc
      const preparedComputer = {...computer};
      
      // Đảm bảo specs là đối tượng, không phải chuỗi
      if (typeof computer.specs === 'string') {
        try {
          preparedComputer.specs = JSON.parse(computer.specs);
        } catch (e) {
          console.warn(`Cannot parse specs for computer ${computer.name}, setting to empty object`);
          // Thay vì null, sử dụng empty object
          preparedComputer.specs = {}; 
        }
      }
      
      return preparedComputer;
    });

    // Sử dụng dữ liệu đã chuẩn bị
    if (preparedComputerData.length > 0) {
      console.log(`Bắt đầu tạo ${preparedComputerData.length} máy tính...`);
      let createdCount = 0;
      
      // Sửa đoạn tạo máy tính với status là enum
      for (const computer of preparedComputerData) {
        try {
          await prisma.computer.create({
            data: {
              name: computer.name,
              status: computer.status,
              roomId: computer.roomId,
              ipAddress: computer.ipAddress, // Thêm trường IP
              macAddress: computer.macAddress, // Tùy chọn
              specs: computer.specs ?? undefined,
              createdAt: computer.createdAt,
              updatedAt: computer.updatedAt
            }
          });
          createdCount++;
        } catch (error) {
          console.error(`Lỗi khi tạo máy tính ${computer.name}: ${error.message}`);
        }
      }
      
      console.log(`Đã tạo thành công ${createdCount}/${preparedComputerData.length} máy tính`);
      
      // Lấy lại danh sách máy tính sau khi tạo
      existingComputers = await prisma.computer.findMany({
        select: { id: true, roomId: true }
      });
    }
  }

  // Lấy danh sách RoomUsage đã tạo
  const createdRoomUsages = await prisma.roomUsage.findMany({
    select: { id: true, roomId: true, startTime: true, endTime: true }
  });

  if (createdRoomUsages.length === 0) {
    console.log('Không có RoomUsage nào để tạo ComputerUsage');
  } else {
    // Tạo danh sách lý do sử dụng máy tính trong phòng thực hành
    const computerNotes = [
      "Sử dụng phần mềm Sibelius để soạn nhạc",
      "Ghi âm và chỉnh sửa bài tập thực hành",
      "Nghiên cứu tài liệu học tập trực tuyến",
      "Làm bài tập về lý thuyết âm nhạc",
      "Sử dụng phần mềm FL Studio để mix nhạc",
      "Xem video hướng dẫn kỹ thuật chơi nhạc cụ",
      "Tìm kiếm tài liệu bổ sung cho môn học",
      "Làm slide thuyết trình cho dự án nhóm",
      "Kiểm tra email và tài liệu học tập",
      "Sử dụng phần mềm Logic Pro cho bài tập sáng tác",
      "Tập luyện nhận biết cao độ với phần mềm ear training",
      "Làm việc với dự án âm thanh kỹ thuật số",
      "Đọc và nghiên cứu tài liệu học thuật âm nhạc",
      "Tham gia lớp học trực tuyến về nhạc lý",
      "Sử dụng phần mềm Ableton Live để sản xuất nhạc",
      "Làm bài kiểm tra trực tuyến"
    ];

    // Tạo dữ liệu ComputerUsage
    const computerUsages: {
      computerId: number;
      roomUsageId: number;
      startTime: Date;
      endTime: Date;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[] = [];
    
    for (const roomUsage of createdRoomUsages) {
      // Lấy máy tính trong phòng tương ứng - THAY COMPUTERS BẰNG EXISTINGCOMPUTERS
      const roomComputers = existingComputers.filter(c => c.roomId === roomUsage.roomId);
      
      if (roomComputers.length === 0) {
        console.log(`Không tìm thấy máy tính nào cho phòng ${roomUsage.roomId}`);
        continue;
      }
      
      // Chọn ngẫu nhiên 1-2 máy tính để sử dụng trong lần đặt phòng này
      const numComputers = Math.min(roomComputers.length, Math.floor(Math.random() * 2) + 1);
      const selectedComputers = [...roomComputers].sort(() => 0.5 - Math.random()).slice(0, numComputers);
      
      for (const computer of selectedComputers) {
        // Tạo thời gian sử dụng máy tính (trong khoảng thời gian đặt phòng)
        const startBuffer = Math.floor(Math.random() * 15) * 60 * 1000;
        const endBuffer = Math.floor(Math.random() * 15) * 60 * 1000;
        
        const computerStartTime = new Date(roomUsage.startTime.getTime() + startBuffer);
        if (!roomUsage.endTime) {
          console.warn(`RoomUsage with ID ${roomUsage.id} has a null endTime.`);
          continue;
        }
        const computerEndTime = new Date(roomUsage.endTime.getTime() - endBuffer);
        
        // Tránh trường hợp thời gian bắt đầu > thời gian kết thúc
        if (computerStartTime >= computerEndTime) {
          continue;
        }
        
        // Thêm notes cho mỗi lần sử dụng máy tính
        const useNote = Math.random() > 0.3 
          ? computerNotes[Math.floor(Math.random() * computerNotes.length)] 
          : null; // 70% có ghi chú, 30% không có
        
        computerUsages.push({
          computerId: computer.id,
          roomUsageId: roomUsage.id,
          startTime: computerStartTime,
          endTime: computerEndTime,
          notes: useNote, // Thêm notes vào computerUsage
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Batch insert computerUsages
    if (computerUsages.length === 0) {
      console.log('Không có dữ liệu ComputerUsage để tạo');
    } else {
      await prisma.computerUsage.createMany({
        data: computerUsages
      });
      
      console.log(`Đã tạo ${computerUsages.length} bản ghi sử dụng máy tính`);
    }
  }

  console.log('Seed dữ liệu hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });