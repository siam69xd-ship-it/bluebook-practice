import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "Is Acely really free?",
    answer: "Yes. Acely is completely free to use. All features are available without payment."
  },
  {
    question: "Do I need to create an account?",
    answer: "You may practice without an account, but creating one allows progress tracking and analytics."
  },
  {
    question: "Are the questions aligned with the Digital SAT?",
    answer: "Yes. Questions are designed to match the format, structure, and skills tested on the Digital SAT."
  },
  {
    question: "Can I practice specific topics?",
    answer: "Yes. You can filter questions by subject, domain, and skill to focus on particular areas."
  },
  {
    question: "Does Acely offer full-length practice tests?",
    answer: "Yes. Acely includes realistic practice tests inspired by the Digital SAT structure."
  },
  {
    question: "Will Acely stay free in the future?",
    answer: "Acely is built with the goal of remaining free and accessible to all students."
  },
  {
    question: "Is Acely affiliated with College Board?",
    answer: "No. Acely is an independent educational platform and is not affiliated with College Board."
  },
  {
    question: "What is Acely?",
    answer: "Acely is an online SAT practice platform designed specifically for the Digital SAT format. It offers structured practice, topic-based filtering, and performance analytics."
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold tracking-tight text-foreground">
              Acely
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/practice" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Practice
              </Link>
              <Link to="/math" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Math
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-6 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          
          <p className="text-muted-foreground mb-10">
            Find answers to common questions about Acely and the Digital SAT.
          </p>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Acely. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}