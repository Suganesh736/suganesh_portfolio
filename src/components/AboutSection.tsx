import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Cpu, Zap, Wifi, GraduationCap } from "lucide-react";

const timeline = [
  { year: "2023", title: "Started Engineering", desc: "Began B.E. journey with a focus on electronics and embedded systems" },
  { year: "2023", title: "First IoT Project", desc: "Built a Line Follower Robot using Arduino and IR sensors" },
  { year: "2024", title: "Advanced Projects", desc: "Developed accident detection systems and smart parking solutions" },
  { year: "Present", title: "IoT Innovator", desc: "Continuing to build real-world hardware + IoT solutions" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-mono text-sm tracking-widest uppercase mb-2">Get to know me</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold gradient-text">About Me</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="glass-card p-8 neon-glow-purple">
              <p className="font-body text-foreground/80 leading-relaxed mb-6">
                I'm <span className="text-primary font-semibold">Suganesh Ranganathan</span>, a second-year engineering student 
                with an intense passion for <span className="text-secondary">embedded systems</span> and IoT development. 
                I believe in bridging the gap between software and hardware to create impactful, real-world solutions.
              </p>
              <p className="font-body text-foreground/70 leading-relaxed mb-8">
                From building line-following robots to accident detection systems, I work with Arduino, ESP32, ESP8266, 
                and various sensors to prototype innovative hardware solutions that solve real problems.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Cpu, label: "Embedded Systems" },
                  { icon: Wifi, label: "IoT Solutions" },
                  { icon: Zap, label: "Hardware Prototyping" },
                  { icon: GraduationCap, label: "2nd Year B.E." },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-body text-sm text-foreground/80">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-6"
          >
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary neon-glow-purple flex-shrink-0 mt-1.5" />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent mt-1" />}
                </div>
                <div className="glass-card p-5 flex-1 hover:border-primary/30 transition-colors">
                  <span className="text-primary font-mono text-xs tracking-wider">{item.year}</span>
                  <h4 className="font-display text-sm font-semibold mt-1 mb-1">{item.title}</h4>
                  <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
