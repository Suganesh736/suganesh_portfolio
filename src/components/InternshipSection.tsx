import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Briefcase, Pencil, X, Save, Plus, Trash2, Calendar, Building2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface Internship {
  company: string;
  role: string;
  duration: string;
  work: string;
}

const defaultInternships: Internship[] = [
  {
    company: "Tech Innovations Lab",
    role: "Embedded Systems Intern",
    duration: "Jun 2024 – Aug 2024",
    work: "Designed and prototyped IoT-based environmental monitoring systems using ESP32 and multiple sensor arrays. Developed firmware in C++ and built a real-time web dashboard for data visualization.",
  },
  {
    company: "Smart Solutions Pvt Ltd",
    role: "IoT Development Intern",
    duration: "Dec 2023 – Feb 2024",
    work: "Worked on automated parking management systems using Arduino and ultrasonic sensors. Integrated GSM modules for remote alerts and contributed to PCB layout design.",
  },
];

const loadInternships = (): Internship[] => {
  try {
    const saved = localStorage.getItem("portfolio_internships");
    return saved ? JSON.parse(saved) : defaultInternships;
  } catch { return defaultInternships; }
};
const saveInternships = (data: Internship[]) => localStorage.setItem("portfolio_internships", JSON.stringify(data));

const emptyInternship: Internship = { company: "", role: "", duration: "", work: "" };

const InternshipSection = () => {
  const [internships, setInternships] = useState<Internship[]>(loadInternships);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Internship[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { requestAuth } = useAdmin();

  const openEdit = () => {
    requestAuth(() => {
      setEditData(JSON.parse(JSON.stringify(internships)));
      setEditMode(true);
    });
  };

  const handleSave = () => {
    setInternships(editData);
    saveInternships(editData);
    setEditMode(false);
  };

  const updateField = (i: number, field: keyof Internship, value: string) => {
    const updated = [...editData];
    updated[i] = { ...updated[i], [field]: value };
    setEditData(updated);
  };

  return (
    <section id="internships" className="section-padding relative overflow-hidden">
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />

      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-secondary font-mono text-sm tracking-widest uppercase mb-2">Experience</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold gradient-text">Internships</h2>
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 text-xs font-mono bg-muted/30 border border-glass-border/30 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
          >
            <Pencil className="w-3 h-3" /> Edit Internships
          </button>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-secondary/40 to-transparent sm:-translate-x-px" />

          <div className="space-y-12">
            {internships.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.2, duration: 0.6, ease: "easeOut" }}
                  className={`relative flex items-start gap-6 sm:gap-0 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full bg-primary neon-glow-purple -translate-x-1.5 mt-6 z-10" />

                  {/* Spacer for opposite side */}
                  <div className="hidden sm:block sm:w-1/2" />

                  {/* Card */}
                  <div className={`ml-10 sm:ml-0 sm:w-1/2 ${isLeft ? "sm:pr-10" : "sm:pl-10"}`}>
                    <motion.div
                      whileHover={{ y: -4, transition: { duration: 0.3 } }}
                      className="glass-card p-6 hover:border-primary/30 transition-all group hover:neon-glow-purple"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-display text-base font-semibold group-hover:text-primary transition-colors">
                            {item.company}
                          </h3>
                          <p className="font-body text-sm text-secondary">{item.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-3 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-mono text-xs">{item.duration}</span>
                      </div>

                      <p className="font-body text-sm text-foreground/70 leading-relaxed">{item.work}</p>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setEditMode(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card neon-glow-purple p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold gradient-text">Edit Internships</h3>
                <button onClick={() => setEditMode(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {editData.map((item, i) => (
                  <div key={i} className="glass-card p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-muted-foreground">Internship {i + 1}</span>
                      <button onClick={() => setEditData(editData.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input value={item.company} onChange={(e) => updateField(i, "company", e.target.value)} placeholder="Company name"
                      className="w-full px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 transition-all" />
                    <input value={item.role} onChange={(e) => updateField(i, "role", e.target.value)} placeholder="Role"
                      className="w-full px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 transition-all" />
                    <input value={item.duration} onChange={(e) => updateField(i, "duration", e.target.value)} placeholder="Duration (e.g. Jun 2024 – Aug 2024)"
                      className="w-full px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 transition-all" />
                    <textarea rows={3} value={item.work} onChange={(e) => updateField(i, "work", e.target.value)} placeholder="Work done"
                      className="w-full px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 transition-all resize-none" />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setEditData([...editData, { ...emptyInternship }])}
                className="mt-4 text-xs text-muted-foreground hover:text-primary font-mono flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Internship
              </button>

              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg flex items-center justify-center gap-2 neon-glow-purple transition-all"
              >
                <Save className="w-4 h-4" /> Save Internships
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default InternshipSection;
