import { useAuthStore } from '../../stores/authStore';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="container py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      <p className="mb-4 text-lg">Welcome, {user?.name}!</p>
      <p>This is the administration dashboard where you can manage rooms, computers, and users.</p>
    </div>
  );
}