import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Pencil, X, Save, Plus, Trash2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface Skill { name: string; level: number; }
interface SkillCategory { title: string; color: string; skills: Skill[]; }

const defaultSkillCategories: SkillCategory[] = [
  {
    title: "Embedded Systems", color: "primary",
    skills: [{ name: "Arduino", level: 90 }, { name: "ESP32", level: 85 }, { name: "ESP8266", level: 80 }, { name: "Circuit Design", level: 75 }],
  },
  {
    title: "Sensors & IoT", color: "secondary",
    skills: [{ name: "IR Sensors", level: 85 }, { name: "Ultrasonic Sensors", level: 80 }, { name: "Temperature Sensors", level: 78 }, { name: "GSM/GPS Modules", level: 70 }],
  },
  {
    title: "Programming", color: "neon-cyan",
    skills: [{ name: "C/C++", level: 80 }, { name: "Arduino IDE", level: 90 }, { name: "Python", level: 65 }, { name: "Problem Solving", level: 75 }],
  },
];

const loadSkills = (): SkillCategory[] => {
  try {
    const saved = localStorage.getItem("portfolio_skills");
    return saved ? JSON.parse(saved) : defaultSkillCategories;
  } catch { return defaultSkillCategories; }
};
const saveSkills = (s: SkillCategory[]) => localStorage.setItem("portfolio_skills", JSON.stringify(s));

const SkillsSection = () => {
  const [categories, setCategories] = useState<SkillCategory[]>(loadSkills);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<SkillCategory[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { requestAuth } = useAdmin();

  const openEdit = () => {
    requestAuth(() => {
      setEditData(JSON.parse(JSON.stringify(categories)));
      setEditMode(true);
    });
  };

  const handleSave = () => {
    setCategories(editData);
    saveSkills(editData);
    setEditMode(false);
  };

  const updateSkill = (ci: number, si: number, field: keyof Skill, value: string | number) => {
    const updated = [...editData];
    (updated[ci].skills[si] as any)[field] = value;
    setEditData(updated);
  };

  const addSkill = (ci: number) => {
    const updated = [...editData];
    updated[ci].skills.push({ name: "", level: 50 });
    setEditData(updated);
  };

  const removeSkill = (ci: number, si: number) => {
    const updated = [...editData];
    updated[ci].skills.splice(si, 1);
    setEditData(updated);
  };

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
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 text-xs font-mono bg-muted/30 border border-glass-border/30 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
          >
            <Pencil className="w-3 h-3" /> Edit Skills
          </button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat, ci) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: ci * 0.2, duration: 0.6 }}
              className="glass-card p-6 hover:border-primary/30 transition-all group"
            >
              <h3 className="font-display text-base font-semibold mb-6 text-center gradient-text">{cat.title}</h3>
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
                <h3 className="font-display text-lg font-bold gradient-text">Edit Skills</h3>
                <button onClick={() => setEditMode(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {editData.map((cat, ci) => (
                  <div key={ci} className="glass-card p-4">
                    <input
                      value={cat.title}
                      onChange={(e) => {
                        const updated = [...editData];
                        updated[ci].title = e.target.value;
                        setEditData(updated);
                      }}
                      className="font-display text-sm font-semibold gradient-text bg-transparent border-b border-glass-border/30 mb-4 w-full focus:outline-none focus:border-primary/50 pb-1"
                    />
                    <div className="space-y-3">
                      {cat.skills.map((skill, si) => (
                        <div key={si} className="flex gap-2 items-center">
                          <input
                            value={skill.name}
                            onChange={(e) => updateSkill(ci, si, "name", e.target.value)}
                            placeholder="Skill name"
                            className="flex-1 px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-xs focus:outline-none focus:border-primary/50 transition-all"
                          />
                          <input
                            type="number"
                            min={0} max={100}
                            value={skill.level}
                            onChange={(e) => updateSkill(ci, si, "level", parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-mono text-xs focus:outline-none focus:border-primary/50 transition-all text-center"
                          />
                          <button onClick={() => removeSkill(ci, si)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addSkill(ci)} className="mt-3 text-xs text-muted-foreground hover:text-primary font-mono flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Skill
                    </button>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg flex items-center justify-center gap-2 neon-glow-purple transition-all"
              >
                <Save className="w-4 h-4" /> Save Skills
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SkillsSection;
