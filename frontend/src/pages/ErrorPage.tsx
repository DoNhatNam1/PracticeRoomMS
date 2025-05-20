import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message || 'Page not found or an error occurred';

  return (
    <div className="container max-w-md py-12 mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 0.5
                }}
              >
                <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
              </motion.div>
              
              <h1 className="mb-2 text-2xl font-bold">
                Oops! Something went wrong
              </h1>
              
              <p className="mb-6 text-muted-foreground">
                {message}
              </p>
              
              <Button 
                onClick={() => navigate('/')} 
                className="gap-2"
              >
                <Home className="w-4 h-4" /> Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}