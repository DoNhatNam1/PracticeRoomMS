import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, GraduationCap, User } from 'lucide-react';

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Admin',
      description: 'Manage rooms, users, equipment and view comprehensive reports.',
      icon: ShieldCheck,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      textColor: 'text-red-600',
      path: '/admin-login'
    },
    {
      title: 'Teacher',
      description: 'Schedule rooms, manage classes and monitor student activities.',
      icon: GraduationCap,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      textColor: 'text-blue-600',
      path: '/teacher/select-room'
    },
    {
      title: 'Student',
      description: 'Book computer time, access practice resources and track your progress.',
      icon: User,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      textColor: 'text-green-600',
      path: '/student/select-room'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="container max-w-6xl px-4 py-16 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <h1 className="mb-4 text-4xl font-bold">Choose Your Role</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Select your role to access features tailored to your needs
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <motion.div key={role.title} variants={item}>
              <Card className="h-full overflow-hidden transition-all duration-300 border-0 shadow-md hover:shadow-lg dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <div className={`w-14 h-14 rounded-full ${role.color} flex items-center justify-center mb-4`}>
                    <Icon className="text-white w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold">{role.title}</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 dark:text-slate-400">{role.description}</p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    className={`${role.textColor} w-full ${role.hoverColor.replace('hover:', '')} hover:text-white transition-colors duration-300`}
                    onClick={() => navigate(role.path)}
                  >
                    Continue
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}