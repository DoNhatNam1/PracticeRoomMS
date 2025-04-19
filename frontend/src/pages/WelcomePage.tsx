import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

// Keep the same background image
const bgImageUrl = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center w-full min-h-screen overflow-hidden bg-black">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Animated background elements */}
      <motion.div 
        className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[80px] animate-float-slow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2 }}
      />
      
      <motion.div 
        className="absolute top-[20%] right-[-80px] w-[350px] h-[350px] bg-cyan-500/20 rounded-full blur-[60px] animate-float"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2, delay: 0.3 }}
      />

      {/* Content container with animation */}
      <div className="container relative z-10 px-6 py-16 mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <motion.h1 
            className="text-[62px] font-extrabold text-white leading-tight mb-8 sm:text-[40px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Practice Room Management System
          </motion.h1>

          <motion.p 
            className="text-[24px] text-white/90 mb-12 max-w-[600px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Streamline your educational experience with our comprehensive practice room and computer
            management solution designed for schools and universities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <Button 
              onClick={() => navigate('/role-selection')}
              className="h-[56px] px-[32px] text-[18px] font-medium"
              size="lg"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}