import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-md py-12 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-4 rounded-full bg-primary/10">
                <BookOpen className="w-12 h-12 text-primary" />
              </div>
            </motion.div>
            
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl text-center">
                Welcome to Practice Room Management System
              </CardTitle>
              <CardDescription className="mt-2 text-base text-center">
                Manage and monitor computer labs, practice rooms, and student activities efficiently.
              </CardDescription>
            </CardHeader>
            
            <motion.div 
              className="flex justify-center mt-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                onClick={() => navigate('/role-selection')}
                className="px-8"
              >
                Get Started
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}