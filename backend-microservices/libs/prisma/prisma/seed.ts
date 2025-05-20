import { PrismaClient, RoomStatus, ComputerStatus, Role, TransferStatus } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/vi';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

// Helper functions
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Computer specifications templates for music practice rooms
const computerSpecs = [
  {
    processor: "Intel Core i7-11700K",
    ram: "32GB DDR4",
    storage: "1TB SSD + 2TB HDD",
    os: "Windows 10 Pro",
    audio: "Focusrite Scarlett 2i2",
    software: ["Ableton Live 11", "FL Studio 20", "Sibelius", "ProTools"],
    gpu: "NVIDIA RTX 3060",
    monitor: "27 inch Dell UltraSharp"
  },
  {
    processor: "AMD Ryzen 9 5900X",
    ram: "64GB DDR4",
    storage: "2TB NVMe SSD",
    os: "Windows 11 Pro",
    audio: "Universal Audio Apollo Twin",
    software: ["Pro Tools", "Logic Pro X", "Finale", "Cubase Pro"],
    gpu: "NVIDIA RTX 3080",
    monitor: "32 inch LG UltraFine"
  },
  {
    processor: "Apple M1 Pro",
    ram: "32GB Unified",
    storage: "1TB SSD",
    os: "macOS Monterey",
    audio: "Native Instruments Komplete Audio 6",
    software: ["Logic Pro X", "GarageBand", "MuseScore", "MainStage"],
    gpu: "Integrated",
    monitor: "27 inch Apple Studio Display"
  },
  {
    processor: "Intel Core i9-12900K",
    ram: "128GB DDR5",
    storage: "4TB NVMe SSD",
    os: "Windows 11 Pro",
    audio: "RME Babyface Pro FS",
    software: ["Cubase Pro", "Reason 12", "Dorico", "Studio One"],
    gpu: "NVIDIA RTX 3090",
    monitor: "34 inch Curved Ultrawide"
  }
];

// Room equipment options for music practice rooms
const roomEquipmentOptions = [
  ["Acoustic Panels", "Studio Monitors", "MIDI Keyboard", "Audio Interface", "Microphones"],
  ["Projector", "Digital Mixer", "Video Recording Equipment", "Acoustic Treatment", "Instrument Storage"],
  ["Electronic Drums", "Amplifiers", "Headphone Distribution System", "Interactive Whiteboard", "Teaching Console"],
  ["Soundproof Booths", "Performance Area", "Recording Equipment", "Instrument Stands", "Reference Library"]
];

async function main() {

  // Clean existing data
  await cleanDatabase();
  
  // Create users with proper creation hierarchy
  const admin = await createAdmin();
  const teachers = await createTeachers(5, admin.id); // Pass admin ID as creator
  const students = await createStudentsByTeachers(teachers, 30, 40); // Create students under their teachers

  // Create 4 rooms with equipment
  const rooms = await createRooms(4);

  // Create ~40 computers per room
  const computers = await createComputers(rooms, 40);

  // Create some room usage data
  await createRoomUsage(students, teachers, rooms);

  // Create some computer usage data
  await createComputerUsage(students, computers);

  // Stop here - don't create activities or file transfers
  // await createActivities(admin, teachers, students, rooms, computers);
  // await createFileTransfers(teachers, students, computers);

}

async function cleanDatabase() {
  
  // Delete in the correct order to respect foreign key constraints
  await prisma.fileTransferTarget.deleteMany({});
  await prisma.fileTransfer.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.computerUsage.deleteMany({});
  await prisma.roomUsage.deleteMany({});
  
  // Add this line to delete Schedule records first
  await prisma.schedule.deleteMany({});
  
  await prisma.computer.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});
  
}

// Admin has no creator
async function createAdmin() {
  
  const hashedPassword = await hashPassword('Password32!');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: Role.ADMIN,
      department: 'IT Department',
      // No createdById for admin (system-created)
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  return admin;
}

// Teachers are created by admin
async function createTeachers(count: number, adminId: number) {
  
  const teachers: Array<{
    id: number;
    email: string;
    password: string;
    name: string;
    phone: string | null;
    role: Role;
    department: string | null;
    isActive: boolean;
    createdById: number | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  const hashedPassword = await hashPassword('Password32!');
  
  // Create one specific teacher for testing
  const specificTeacher = await prisma.user.create({
    data: {
      email: 'newteacher@example.com',
      password: hashedPassword,
      name: 'New Teacher',
      role: Role.TEACHER,
      department: 'Music Department',
      createdById: adminId, // Admin created this teacher
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  teachers.push(specificTeacher);
  
  // Create remaining teachers
  for (let i = 1; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    const teacher = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: Role.TEACHER,
        department: faker.helpers.arrayElement([
          'Piano Department', 
          'String Instruments Department', 
          'Wind Instruments Department', 
          'Percussion Department'
        ]),
        createdById: adminId, // Admin created all teachers
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    teachers.push(teacher);
  }
  
  return teachers;
}

// Students are created by teachers (distributed among teachers)
async function createStudentsByTeachers(teachers: any[], minPerTeacher: number, maxPerTeacher: number) {
  
  const students: Array<{
    id: number;
    email: string;
    password: string;
    name: string;
    phone: string | null;
    role: Role;
    department: string | null;
    isActive: boolean;
    createdById: number | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  const hashedPassword = await hashPassword('Password32!');
  
  // Create specific student for testing, assigned to first teacher
  const firstTeacher = teachers.find(t => t.email === 'newteacher@example.com') || teachers[0];
  
  const specificStudent = await prisma.user.create({
    data: {
      email: 'newstudent@example.com',
      password: hashedPassword,
      name: 'New Student',
      role: Role.STUDENT,
      department: 'Computer Science',
      createdById: firstTeacher.id, // This specific teacher created this student
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  students.push(specificStudent);
  
  // Create random students for each teacher
  for (const teacher of teachers) {
    const studentCount = Math.floor(Math.random() * (maxPerTeacher - minPerTeacher + 1)) + minPerTeacher;
    
    for (let i = 0; i < studentCount; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      try {
        const student = await prisma.user.create({
          data: {
            email: faker.internet.email({ firstName, lastName }).toLowerCase(),
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            role: Role.STUDENT,
            department: faker.helpers.arrayElement([
              'Piano Performance', 
              'Violin Performance', 
              'Music Composition', 
              'Music Theory',
              'Jazz Studies',
              'Music Education',
              'Music Technology'
            ]),
            createdById: teacher.id, // This teacher created this student
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        students.push(student);
      } catch (error) {
        console.error(`Error creating student: ${error.message}`);
        // Continue with next student if there's an error (likely duplicate email)
      }
    }
  }
  
  return students;
}

async function createRooms(count: number) {
  
  const rooms: Array<{
    id: number;
    name: string;
    location: string | null;
    capacity: number;
    description: string | null;
    isActive: boolean;
    status: RoomStatus;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  const buildings = ['A', 'B', 'C'];
  const roomTypes = ['Piano Studio', 'Ensemble Room', 'Recording Studio', 'Practice Room'];
  
  for (let i = 0; i < count; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];
    const floor = Math.floor(Math.random() * 5) + 1;
    const roomType = roomTypes[i % roomTypes.length];
    const equipmentSet = roomEquipmentOptions[i % roomEquipmentOptions.length];
    
    const room = await prisma.room.create({
      data: {
        name: `${roomType} ${building}${floor}0${i+1}`,
        // Removed 'building' property as it is not defined in the Prisma schema
        // floor property removed as it is not defined in the Prisma schema
        capacity: Math.floor(Math.random() * 30) + 20, // 20-50 capacity
        status: RoomStatus.AVAILABLE,
        // equipment: equipmentSet, // Removed as it is not defined in the Prisma schema
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    rooms.push(room);
  }
  
  return rooms;
}

async function createComputers(rooms: any[], perRoom: number) {
  
  const computers: Array<{
    id: number;
    name: string;
    status: ComputerStatus;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    macAddress: string | null;
    specs: any; // Adjust 'any' to the correct type if known
    roomId: number;
  }> = [];
  
  for (const room of rooms) {
    // Vary the number slightly per room
    const actualCount = Math.floor(perRoom * (0.9 + Math.random() * 0.2)); // 90-110% of perRoom
    
    for (let i = 0; i < actualCount; i++) {
      const specs = computerSpecs[Math.floor(Math.random() * computerSpecs.length)];
      
      // Create sequential IP addresses in the same subnet for each room
      const ipAddress = `192.168.${room.id}.${i+10}`;
      const macAddress = faker.internet.mac();
      
      const computer = await prisma.computer.create({
        data: {
          name: `PC-${room.id}-${i+1}`,
          roomId: room.id,
          ipAddress: ipAddress,
          macAddress: macAddress,
          status: ComputerStatus.OPERATIONAL,
          specs: specs,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      computers.push(computer);
    }
  }
  
  return computers;
}

async function createRoomUsage(students: any[], teachers: any[], rooms: any[]) {
  
  const roomUsages: Array<{
    id: number;
    roomId: number;
    userId: number;
    startTime: Date;
    endTime: Date | null;
    purpose: string | null;
    createdAt: Date;
    updatedAt: Date;
    scheduleId: number | null;
  }> = [];
  const purposes = [
    "Piano practice session",
    "Ensemble rehearsal",
    "Individual instrument practice",
    "Recording session",
    "Music theory tutoring",
    "Composition project work",
    "Performance preparation",
    "Music software training",
    "Technical ear training",
    "Audio engineering practice"
  ];
  
  // Create usage for each student with some randomness
  for (const student of students) {
    // 80% chance each student has at least one room usage
    if (Math.random() < 0.8) {
      // 1-3 room usages per student
      const usageCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < usageCount; i++) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        
        // Random dates within 30 days past/future
        const startTime = randomDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );
        
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 3) + 1); // 1-3 hours
        
        const roomUsage = await prisma.roomUsage.create({
          data: {
            userId: student.id,
            roomId: room.id,
            startTime: startTime,
            endTime: endTime,
            purpose: purposes[Math.floor(Math.random() * purposes.length)],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        roomUsages.push(roomUsage);
      }
    }
  }
  
  // Also create some room usage for teachers
  for (const teacher of teachers) {
    // 90% chance each teacher has at least one room usage
    if (Math.random() < 0.9) {
      const usageCount = Math.floor(Math.random() * 2) + 1; // 1-2 room usages per teacher
      
      for (let i = 0; i < usageCount; i++) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        
        const startTime = randomDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );
        
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 4) + 2); // 2-5 hours for teachers
        
        const roomUsage = await prisma.roomUsage.create({
          data: {
            userId: teacher.id,
            roomId: room.id,
            startTime: startTime,
            endTime: endTime,
            purpose: "Class teaching session",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        roomUsages.push(roomUsage);
      }
    }
  }
  
  return roomUsages;
}

async function createComputerUsage(students: any[], computers: any[]) {
  
  const computerUsages: Array<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    startTime: Date;
    endTime: Date | null;
    computerId: number;
    notes: string | null;
    roomUsageId: number;
  }> = [];
  const notes = [
    "Working on Sibelius composition project",
    "Practicing with ear training software",
    "Recording MIDI tracks in Ableton",
    "Mixing session in Pro Tools",
    "Learning music theory with interactive software",
    "Editing recording for portfolio",
    "Researching musical techniques online",
    "Working on transcription assignment",
    "Virtual piano practice session",
    "Video conference with instructor"
  ];
  
  // Get room usages to link computer usage
  const roomUsages = await prisma.roomUsage.findMany();
  
  // Create computer usage for 70% of room usages
  for (const roomUsage of roomUsages) {
    if (Math.random() < 0.7) {
      // Get computers in the used room
      const roomComputers = computers.filter(c => c.roomId === roomUsage.roomId);
      
      if (roomComputers.length > 0) {
        // Use 1-3 computers during this room usage
        const usedComputerCount = Math.min(Math.floor(Math.random() * 3) + 1, roomComputers.length);
        
        // Randomly select computers
        const usedComputers = [...roomComputers]
          .sort(() => 0.5 - Math.random())
          .slice(0, usedComputerCount);
        
        for (const computer of usedComputers) {
          // Start a bit after room usage starts
          const startBuffer = Math.floor(Math.random() * 15) * 60 * 1000; // 0-15 minutes later
          const computerStartTime = new Date(roomUsage.startTime.getTime() + startBuffer);
          
          // End a bit before room usage ends
          const endBuffer = Math.floor(Math.random() * 15) * 60 * 1000; // 0-15 minutes earlier
          const computerEndTime = roomUsage.endTime ? new Date(roomUsage.endTime.getTime() - endBuffer) : new Date();
          
          // Only create valid time periods
          if (computerStartTime < computerEndTime) {
            const computerUsage = await prisma.computerUsage.create({
              data: {
                computerId: computer.id,
                roomUsageId: roomUsage.id,
                startTime: computerStartTime,
                endTime: computerEndTime,
                notes: Math.random() < 0.8 ? notes[Math.floor(Math.random() * notes.length)] : null,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
            
            computerUsages.push(computerUsage);
          }
        }
      }
    }
  }
  
  return computerUsages;
}

async function createActivities(admin: any, teachers: any[], students: any[], rooms: any[], computers: any[]) {
  return; // Skip this entire function
}

async function createFileTransfers(teachers: any[], students: any[], computers: any[]) {
  
  const fileTypes = [
    { extension: 'pdf', mimetype: 'application/pdf', prefix: 'lecture_notes' },
    { extension: 'docx', mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', prefix: 'assignment' },
    { extension: 'zip', mimetype: 'application/zip', prefix: 'project_files' },
    { extension: 'mp3', mimetype: 'audio/mpeg', prefix: 'sample_recording' }
  ];
  
  const statuses = ['PENDING', 'COMPLETED', 'FAILED', 'REJECTED'];
  
  let transferCount = 0;
  
  // Each teacher sends files to some of their students
  for (const teacher of teachers) {
    // Determine how many transfers this teacher makes (2-5)
    const transfersPerTeacher = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < transfersPerTeacher; i++) {
      // Pick a random file type
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
      const filename = `${Date.now()}-${fileType.prefix}_${i+1}.${fileType.extension}`;
      
      // Select source computer (assume teacher can use any computer)
      const sourceComputer = computers[Math.floor(Math.random() * computers.length)];
      
      // The transfer will be sent to 1-10 computers
      const targetCount = Math.floor(Math.random() * 10) + 1;
      const targetComputers = [...computers]
        .sort(() => 0.5 - Math.random())
        .slice(0, targetCount);
      
      // Create file transfer record
      const transfer = await prisma.fileTransfer.create({
        data: {
          filename: filename,
          originalName: `${fileType.prefix}_${i+1}.${fileType.extension}`,
          size: Math.floor(Math.random() * 10000000) + 10000, // 10KB to 10MB
          mimeType: fileType.mimetype,
          path: filename, // In a real app, this would be a path to the stored file
          sourceId: sourceComputer.id,
          userId: teacher.id,
          status: 'PENDING', // Start with PENDING
          transferredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Create targets
      for (const targetComputer of targetComputers) {
        // Determine status (weighted more toward COMPLETED)
        const status = Math.random() < 0.7 
          ? 'COMPLETED' 
          : statuses[Math.floor(Math.random() * statuses.length)];
        
        await prisma.fileTransferTarget.create({
          data: {
            fileTransferId: transfer.id,
            computerId: targetComputer.id,
            status: status as TransferStatus,
          }
        });
      }
      
      // Create one special transfer for testing (teacher to studentId=1)
      if (i === 0) {
        // Get first student computer
        const firstStudent = students.find(s => s.email === 'newstudent@example.com');
        if (firstStudent && computers.length > 0) {
          const studentComputer = computers[0]; // Use first computer
          
          const testTransfer = await prisma.fileTransfer.create({
            data: {
              filename: `test_lecture_notes.pdf`,
              originalName: `lecture_notes.pdf`,
              size: 5000,
              mimeType: 'application/pdf',
              path: `test_lecture_notes.pdf`,
              sourceId: sourceComputer.id,
              userId: teacher.id,
              status: 'PENDING',
              transferredAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          await prisma.fileTransferTarget.create({
            data: {
              fileTransferId: testTransfer.id,
              computerId: studentComputer.id,
              status: 'PENDING',
            }
          });
          
          transferCount += 2; // Count main transfer + test transfer
        }
      }
      
      transferCount++;
    }
  }
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });