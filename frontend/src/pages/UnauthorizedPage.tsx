import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertOctagon } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-slate-50 dark:bg-slate-900">
      <motion.div 
        className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-lg dark:bg-slate-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200
          }}
        >
          <AlertOctagon className="w-20 h-20 text-red-500" />
        </motion.div>
        
        <motion.h1 
          className="text-3xl font-bold text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Unauthorized Access
        </motion.h1>
        
        <motion.p 
          className="text-lg text-slate-600 dark:text-slate-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          You don't have permission to access this page.
        </motion.p>
        
        <motion.div 
          className="pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button 
            onClick={() => navigate('/role-selection')}
            className="px-6 font-medium"
            size="lg"
          >
            Return to Role Selection
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}