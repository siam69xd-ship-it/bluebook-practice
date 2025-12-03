import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Auth() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-primary-foreground">NP</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Welcome to NextPrep</h1>
            <p className="text-muted-foreground mt-2">
              Start practicing with authentic SAT questions
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/quiz')}
            className="w-full h-12 text-base"
          >
            Start Practicing
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-6">
            All features are available without signing in
          </p>
        </div>
      </motion.div>
    </div>
  );
}
