import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Cpu, Wifi, Radio, ParkingSquare } from "lucide-react";

const projects = [
  {
    title: "Line Follower Robot",
    icon: Cpu,
    description: "An autonomous robot that follows a predefined path using IR sensors and motor control algorithms.",
    components: ["Arduino Uno", "IR Sensors (x3)", "L298N Motor Driver", "DC Motors", "Chassis"],
    working: "The IR sensors detect the black line on a white surface. The Arduino processes sensor data and adjusts motor speeds via the L298N driver to keep the robot aligned on the path. PID control logic ensures smooth turning.",
    gradient: "from-primary to-accent",
  },
  {
    title: "Automatic Accident Detector & SMS Alert",
    icon: Radio,
    description: "A system that detects vehicle accidents using sensors and immediately sends an SMS alert with GPS coordinates to emergency contacts.",
    components: ["Arduino Mega", "MPU6050 Accelerometer", "GSM Module (SIM800L)", "GPS Module (NEO-6M)", "Buzzer"],
    working: "The MPU6050 accelerometer detects sudden impact or tilt changes. When values exceed the threshold, the Arduino triggers the GSM module to send an SMS with GPS coordinates to pre-configured emergency numbers.",
    gradient: "from-destructive to-primary",
  },
  {
    title: "Support System for Aged People",
    icon: Wifi,
    description: "An IoT-based health monitoring and emergency alert system designed for elderly care.",
    components: ["ESP32", "Pulse Oximeter (MAX30100)", "Temperature Sensor", "Push Button", "Buzzer", "OLED Display"],
    working: "Continuously monitors heart rate and body temperature using ESP32. Data is displayed on the OLED. An emergency button sends an instant alert notification. Data can also be monitored remotely via a web dashboard.",
    gradient: "from-secondary to-neon-cyan",
  },
  {
    title: "Smart Parking System",
    icon: ParkingSquare,
    description: "An automated parking management system that detects available slots and displays real-time availability.",
    components: ["Arduino Nano", "Ultrasonic Sensors (x4)", "Servo Motor", "LCD Display (16x2)", "LED Indicators"],
    working: "Ultrasonic sensors detect vehicles in each parking slot. The Arduino counts available spots and displays them on the LCD. The servo motor controls the entry gate barrier, opening only when spots are available.",
    gradient: "from-neon-cyan to-primary",
  },
];

const ProjectsSection = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="section-padding relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-mono text-sm tracking-widest uppercase mb-2">My Work</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold gradient-text">Featured Projects</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                onClick={() => setSelected(i)}
                className="glass-card p-6 cursor-pointer group hover:border-primary/40 transition-all hover:neon-glow-purple"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-1 mt-4 text-primary text-xs font-mono">
                  <ExternalLink className="w-3 h-3" /> View Details
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card neon-glow-purple p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  {(() => { const Icon = projects[selected].icon; return (
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${projects[selected].gradient} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                  ); })()}
                  <h3 className="font-display text-xl font-bold gradient-text">{projects[selected].title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="font-display text-xs tracking-wider text-primary uppercase mb-2">Description</h4>
                  <p className="font-body text-sm text-foreground/80 leading-relaxed">{projects[selected].description}</p>
                </div>

                <div>
                  <h4 className="font-display text-xs tracking-wider text-primary uppercase mb-2">Components Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {projects[selected].components.map((c) => (
                      <span key={c} className="px-3 py-1 text-xs font-mono bg-muted/50 rounded-full border border-glass-border/30 text-foreground/70">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-display text-xs tracking-wider text-primary uppercase mb-2">How It Works</h4>
                  <p className="font-body text-sm text-foreground/70 leading-relaxed">{projects[selected].working}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsSection;
