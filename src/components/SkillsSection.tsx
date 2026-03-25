import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  {
    title: "Embedded Systems",
    color: "primary",
    skills: [
      { name: "Arduino", level: 90 },
      { name: "ESP32", level: 85 },
      { name: "ESP8266", level: 80 },
      { name: "Circuit Design", level: 75 },
    ],
  },
  {
    title: "Sensors & IoT",
    color: "secondary",
    skills: [
      { name: "IR Sensors", level: 85 },
      { name: "Ultrasonic Sensors", level: 80 },
      { name: "Temperature Sensors", level: 78 },
      { name: "GSM/GPS Modules", level: 70 },
    ],
  },
  {
    title: "Programming",
    color: "neon-cyan",
    skills: [
      { name: "C/C++", level: 80 },
      { name: "Arduino IDE", level: 90 },
      { name: "Python", level: 65 },
      { name: "Problem Solving", level: 75 },
    ],
  },
];

const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="section-padding relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-secondary font-mono text-sm tracking-widest uppercase mb-2">What I Work With</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold gradient-text">Skills & Tools</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {skillCategories.map((cat, ci) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: ci * 0.2, duration: 0.6 }}
              className="glass-card p-6 hover:border-primary/30 transition-all group"
            >
              <h3 className="font-display text-base font-semibold mb-6 text-center gradient-text">
                {cat.title}
              </h3>
              <div className="space-y-5">
                {cat.skills.map((skill, si) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-body text-sm text-foreground/80">{skill.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${skill.level}%` } : {}}
                        transition={{ delay: 0.5 + ci * 0.2 + si * 0.1, duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
