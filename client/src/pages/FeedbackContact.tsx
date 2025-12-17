import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  MessageCircle, 
  Mail, 
  MapPin, 
  ArrowRight, 
  CheckCircle2,
  Twitter,
  Github,
  Linkedin,
  Send,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bgImage from "../../../attached_assets/soft_ethereal_light_leak_gradient_background.png";

// Animation variants
const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.2, 0.8, 0.2, 1]
    }
  }
};

const hoverCard: Variants = {
  initial: { y: 0, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)" },
  hover: { 
    y: -4, 
    boxShadow: "0 20px 40px -4px rgba(0, 0, 0, 0.08)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};
const getNpsColor = (score: number) => {
  if (score <= 6) return "bg-red-500 text-white";
  if (score <= 8) return "bg-yellow-400 text-black";
  return "bg-emerald-500 text-white";
};
const getFeedbackLabel = (score: number | null) => {
  if (score === null) return "Your feedback";

  if (score <= 6) {
    return "What could we do better?";
  }

  if (score <= 8) {
    return "What can we improve to make your experience better?";
  }

  return "What did you like the most?";
};

export default function FeedbackContact() {
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNpsSelect = (score: number) => {
    setNpsScore(score);
  };

  // const handleSubmitFeedback = (e: React.FormEvent) => {
  //   e.preventDefault();
  
  //   if (npsScore === null) {
  //     setError("Please select a score before submitting.");
  //     return;
  //   }
  
  //   const feedbackText = (e.currentTarget as HTMLFormElement)
  //     .feedback
  //     .value
  //     .trim();
  
  //   if (!feedbackText) {
  //     setError("Please share your thoughts before submitting.");
  //     return;
  //   }
  
  //   setError(null);
  //   setFeedbackSubmitted(true);
  // };
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (npsScore === null) {
      setError("Please select a score before submitting.");
      return;
    }
  
    const feedbackText = (e.currentTarget as HTMLFormElement)
      .feedback
      .value
      .trim();
  
    if (!feedbackText) {
      setError("Please share your thoughts before submitting.");
      return;
    }
  
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ sends cookie
        body: JSON.stringify({
          score: npsScore,
          feedback: feedbackText,
        }),
      });
  
      if (!response.ok) {
        let message = "Failed to submit feedback";
      
        try {
          const data = await response.json();
          if (data && data.message) {
            message = data.message;
          }
        } catch {
          // response had no JSON (404, empty body, etc.)
        }
      
        throw new Error(message);
      }
      
  
      setError(null);
      setFeedbackSubmitted(true);
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err:any) {
      // setError("Please login to submit feedback.");
      setError(err.message);
    }
  };
  
  const getEmotionConfig = (score: number | null) => {
    if (score === null) {
      return {
        emoji: "🙂",
        label: "Select a score",
        glow: "bg-gray-200/40",
      };
    }
  
    if (score <= 6) {
      return {
        emoji: "😞",
        label: "Not satisfied",
        glow: "bg-red-400/30",
      };
    }
  
    if (score <= 8) {
      return {
        emoji: "😐",
        label: "It's okay",
        glow: "bg-yellow-300/30",
      };
    }
  
    return {
      emoji: "😄",
      label: "Loved it!",
      glow: "bg-emerald-400/30",
    };
  };
  const emotion = getEmotionConfig(npsScore);
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden text-foreground selection:bg-primary/5 selection:text-primary
    mt-2">
      {/* Immersive Background */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      

      <main className="relative z-10 container mx-auto px-4 max-w-6xl">
        
        <div 
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-12 lg:gap-24"
        >
          {/* Left Column: Context & Contact */}
          <div className="lg:col-span-5 space-y-12">
            <motion.div variants={item} className="space-y-6">
              <div>
                {/* <Sparkles className="h-3 w-3" /> */}
                <span></span>
              </div>
              <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-balance text-primary leading-[0.95]">
                Let's Connect
              </h1>
              <p className="text-xl text-muted-foreground/90 leading-relaxed font-light">
                  We’re here to listen. Share your feedback, questions, or ideas, and help us build something better.
              </p>
            </motion.div>

            <motion.div variants={item} className="space-y-6">
              {/* Enhanced Chat Card */}
              {/* <motion.div 
                whileHover="hover"
                variants={hoverCard}
                className="group relative overflow-hidden rounded-3xl bg-white border border-white/50 p-6 transition-all"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Online
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-heading font-semibold mb-1">Chat Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">Typical reply in under 5 minutes</p>
                  <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                    Start a conversation <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div> */}

              {/* Enhanced Email Card */}
              <motion.div 
                whileHover="hover"
                variants={hoverCard}
                className="group relative overflow-hidden rounded-3xl bg-white border border-white/50 p-6 transition-all"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-heading font-semibold mb-1">Email Us</h3>
                  <p className="text-sm text-muted-foreground mb-4">For inquiries & partnerships</p>
                  <a href="mailto:ProdigyDev@gmail.com" className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                    ProdigyDev@gmail.com<ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={item} className="pt-8 border-t border-black/5">
               <div className="flex items-center gap-6 text-muted-foreground">
                  <a href="#" className="hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                  <a href="#" className="hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
                  <a href="#" className="hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
                  {/* <span className="text-sm ml-auto">San Francisco, CA</span> */}
               </div>
            </motion.div>
          </div>

          {/* Right Column: Feedback Experience */}
          <div className="lg:col-span-7 lg:pl-12 pt-8 lg:pt-0">
            <motion.div 
              variants={item}
              className="sticky top-32"
            >
              <div className="glass-panel rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
                {/* Subtle gradient blob behind form */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <AnimatePresence mode="wait">
                    {!feedbackSubmitted ? (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="mb-10">
                          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-gradient-subtle inline-block">
                            How was your experience?
                          </h2>
                          <p className="text-lg text-muted-foreground">
                            Your feedback helps us build a better platform.
                          </p>
                        </div>

                        <div className="space-y-8">
                          {/* Animated Emotion */}
                          {/* <div className="flex flex-col items-center gap-2">
                            <motion.div
                              key={npsScore} // re-animates on every score change
                              initial={{ scale: 0.7, rotate: -10, opacity: 0 }}
                              animate={{
                                scale: [0.7, 1.2, 1],
                                rotate: [0, 8, -8, 0],
                                opacity: 1,
                              }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="relative"
                            >
                             
                              <motion.div
                                className={`absolute inset-0 rounded-full blur-2xl ${emotion.glow}`}
                                animate={{ scale: [0.8, 1.1, 1] }}
                                transition={{ duration: 0.6 }}
                              />

                              
                              <div className="relative text-3xl md:text-4xl">
                                {emotion.emoji}
                              </div>
                            </motion.div>

                     
                            <motion.p
                              key={`${npsScore}-label`}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="text-sm font-medium text-muted-foreground"
                            >
                              {emotion.label}
                            </motion.p>
                          </div> */}

                          {/* Interactive NPS Scale */}
                          <div className="relative">
                            <div className="flex justify-between items-end mb-4 px-2">
                              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Not Likely</span>
                              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Very Likely</span>
                            </div>
                            
                            <div className="flex justify-between gap-1">
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                <button
                                  key={score}
                                  onMouseEnter={() => setHoveredScore(score)}
                                  onMouseLeave={() => setHoveredScore(null)}
                                  onClick={() => handleNpsSelect(score)}
                                  className="relative group flex-1"
                                >
                                  <div 
                                    className={`
                                      aspect-[3/4] rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300
                                      ${(npsScore === score || hoveredScore === score)
                                        ? `${getNpsColor(score)} scale-110 shadow-lg translate-y-[-8px]`
                                        : 'bg-white text-muted-foreground hover:shadow-md hover:scale-105 hover:translate-y-[-4px]'
                                      }                                      
                                      border border-transparent
                                      ${npsScore === null && hoveredScore !== null && Math.abs(hoveredScore - score) === 1 ? 'scale-105 opacity-80' : ''}
                                    `}
                                  >
                                    {score}
                                  </div>
                                  {/* Connectors */}
                                  {score < 10 && (
                                    <div className="absolute top-1/2 -right-[2px] w-[4px] h-[2px] bg-black/5 -z-10" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Dynamic Form Reveal */}
                          <motion.div
                            initial={false}
                            animate={{ 
                              height: npsScore !== null ? 'auto' : 0,
                              opacity: npsScore !== null ? 1 : 0
                            }}
                            className="overflow-hidden"
                          >
                            <form onSubmit={handleSubmitFeedback} className="pt-4 space-y-6">
                              <div className="space-y-4">
                              <Label htmlFor="feedback" className="text-base font-medium">
                                {getFeedbackLabel(npsScore)}
                              </Label>
                                <Textarea 
                                  id="feedback" 
                                  placeholder="Share your thoughts..." 
                                  className="resize-none border-0 bg-white shadow-sm ring-1 ring-black/5 focus-visible:ring-primary/20 min-h-[120px] rounded-2xl text-base p-4"
                                />
                              </div>
                              {error && (
                                  <p className="text-sm text-red-500 font-medium">
                                    {error}
                                  </p>
                                )}
                              <div className="flex gap-4">
                                {/* <Input 
                                  id="email" 
                                  type="email" 
                                  placeholder="Email (optional)" 
                                  className="border-0 bg-white shadow-sm ring-1 ring-black/5 focus-visible:ring-primary/20 rounded-2xl h-12 px-4" 
                                /> */}
                                

                                <Button
                                  type="submit"
                                  size="lg"
                                  disabled={npsScore === null}
                                  className="rounded-2xl px-8 h-12 text-base shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Send <Send className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </form>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "backOut" }}
                        className="flex flex-col items-center justify-center text-center py-24 space-y-6"
                      >
                        <div className="h-24 w-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50 animate-pulse">
                          <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <h2 className="text-3xl font-heading font-bold text-primary">Feedback Sent!</h2>
                        <p className="text-muted-foreground max-w-md text-lg">
                          Thank you for helping us improve.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-8 rounded-full border-black/10 hover:bg-black/5"
                          onClick={() => {
                            setFeedbackSubmitted(false);
                            setNpsScore(null);
                          }}
                        >
                          Send another response
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </main>
    </div>
  );
}
