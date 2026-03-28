import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Cpu, Wifi, Radio, ParkingSquare, Pencil, Plus, Image, Trash2, Save } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { loadContent, saveContent, uploadFile } from "@/lib/portfolio-db";

interface Project {
  title: string;
  iconName: string;
  description: string;
  components: string[];
  working: string;
  gradient: string;
  image?: string;
}

const iconMap: Record<string, any> = { Cpu, Wifi, Radio, ParkingSquare };

const defaultProjects: Project[] = [
  {
    title: "Line Follower Robot", iconName: "Cpu",
    description: "An autonomous robot that follows a predefined path using IR sensors and motor control algorithms.",
    components: ["Arduino Uno", "IR Sensors (x3)", "L298N Motor Driver", "DC Motors", "Chassis"],
    working: "The IR sensors detect the black line on a white surface. The Arduino processes sensor data and adjusts motor speeds via the L298N driver to keep the robot aligned on the path. PID control logic ensures smooth turning.",
    gradient: "from-primary to-accent",
  },
  {
    title: "Automatic Accident Detector & SMS Alert", iconName: "Radio",
    description: "A system that detects vehicle accidents using sensors and immediately sends an SMS alert with GPS coordinates to emergency contacts.",
    components: ["Arduino Mega", "MPU6050 Accelerometer", "GSM Module (SIM800L)", "GPS Module (NEO-6M)", "Buzzer"],
    working: "The MPU6050 accelerometer detects sudden impact or tilt changes. When values exceed the threshold, the Arduino triggers the GSM module to send an SMS with GPS coordinates to pre-configured emergency numbers.",
    gradient: "from-destructive to-primary",
  },
  {
    title: "Support System for Aged People", iconName: "Wifi",
    description: "An IoT-based health monitoring and emergency alert system designed for elderly care.",
    components: ["ESP32", "Pulse Oximeter (MAX30100)", "Temperature Sensor", "Push Button", "Buzzer", "OLED Display"],
    working: "Continuously monitors heart rate and body temperature using ESP32. Data is displayed on the OLED. An emergency button sends an instant alert notification. Data can also be monitored remotely via a web dashboard.",
    gradient: "from-secondary to-neon-cyan",
  },
  {
    title: "Smart Parking System", iconName: "ParkingSquare",
    description: "An automated parking management system that detects available slots and displays real-time availability.",
    components: ["Arduino Nano", "Ultrasonic Sensors (x4)", "Servo Motor", "LCD Display (16x2)", "LED Indicators"],
    working: "Ultrasonic sensors detect vehicles in each parking slot. The Arduino counts available spots and displays them on the LCD. The servo motor controls the entry gate barrier, opening only when spots are available.",
    gradient: "from-neon-cyan to-primary",
  },
];

const gradientOptions = [
  "from-primary to-accent",
  "from-destructive to-primary",
  "from-secondary to-neon-cyan",
  "from-neon-cyan to-primary",
  "from-primary to-secondary",
];

const emptyProject: Project = {
  title: "", iconName: "Cpu", description: "", components: [], working: "",
  gradient: "from-primary to-accent", image: "",
};

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [selected, setSelected] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<"edit" | "add" | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Project>(emptyProject);
  const [componentsInput, setComponentsInput] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { requestAuth } = useAdmin();

  useEffect(() => {
    loadContent<Project[]>("projects", defaultProjects).then(setProjects);
  }, []);

  const openEditProject = (index: number) => {
    requestAuth(() => {
      setEditForm({ ...projects[index] });
      setComponentsInput(projects[index].components.join(", "));
      setEditIndex(index);
      setEditMode("edit");
    });
  };

  const openAddProject = () => {
    requestAuth(() => {
      setEditForm({ ...emptyProject });
      setComponentsInput("");
      setEditIndex(null);
      setEditMode("add");
    });
  };

  const handleSave = async () => {
    const updated = { ...editForm, components: componentsInput.split(",").map(s => s.trim()).filter(Boolean) };
    let newProjects: Project[];
    if (editMode === "edit" && editIndex !== null) {
      newProjects = [...projects];
      newProjects[editIndex] = updated;
    } else {
      newProjects = [...projects, updated];
    }
    setProjects(newProjects);
    setEditMode(null);
    await saveContent("projects", newProjects);
  };

  const handleDelete = (index: number) => {
    requestAuth(async () => {
      const newProjects = projects.filter((_, i) => i !== index);
      setProjects(newProjects);
      await saveContent("projects", newProjects);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, `projects/${Date.now()}.${file.name.split('.').pop()}`);
    setEditForm({ ...editForm, image: url });
  };

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
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => requestAuth(() => setEditMode("edit"))}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-muted/30 border border-glass-border/30 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
            >
              <Pencil className="w-3 h-3" /> Edit Projects
            </button>
            <button
              onClick={openAddProject}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-muted/30 border border-glass-border/30 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
            >
              <Plus className="w-3 h-3" /> Add Project
            </button>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map((p, i) => {
            const Icon = iconMap[p.iconName] || Cpu;
            return (
              <motion.div
                key={`${p.title}-${i}`}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                onClick={() => setSelected(i)}
                className="glass-card p-6 cursor-pointer group hover:border-primary/40 transition-all hover:neon-glow-purple relative"
              >
                {p.image && (
                  <div className="mb-4 rounded-lg overflow-hidden h-40">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {!p.image && (
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-primary text-xs font-mono">
                    <ExternalLink className="w-3 h-3" /> View Details
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEditProject(i)} className="text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected !== null && !editMode && (
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
                  {(() => { const Icon = iconMap[projects[selected].iconName] || Cpu; return (
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
                {projects[selected].image && (
                  <div className="rounded-lg overflow-hidden">
                    <img src={projects[selected].image} alt={projects[selected].title} className="w-full h-56 object-cover rounded-lg" />
                  </div>
                )}
                <div>
                  <h4 className="font-display text-xs tracking-wider text-primary uppercase mb-2">Description</h4>
                  <p className="font-body text-sm text-foreground/80 leading-relaxed">{projects[selected].description}</p>
                </div>
                <div>
                  <h4 className="font-display text-xs tracking-wider text-primary uppercase mb-2">Components Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {projects[selected].components.map((c) => (
                      <span key={c} className="px-3 py-1 text-xs font-mono bg-muted/50 rounded-full border border-glass-border/30 text-foreground/70">{c}</span>
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

      {/* Edit/Add Form Modal */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setEditMode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card neon-glow-purple p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold gradient-text">
                  {editMode === "add" ? "Add New Project" : "Edit Project"}
                </h3>
                <button onClick={() => setEditMode(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editMode === "edit" && editIndex === null ? (
                <div className="space-y-3">
                  <p className="font-body text-sm text-muted-foreground mb-4">Select a project to edit:</p>
                  {projects.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => openEditProject(i)}
                      className="w-full text-left glass-card p-4 hover:border-primary/40 transition-all flex items-center gap-3"
                    >
                      {(() => { const Icon = iconMap[p.iconName] || Cpu; return <Icon className="w-5 h-5 text-primary" />; })()}
                      <span className="font-body text-sm">{p.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1.5 block">Title</label>
                    <input
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1.5 block">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1.5 block">Components (comma-separated)</label>
                    <input
                      value={componentsInput}
                      onChange={(e) => setComponentsInput(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1.5 block">How It Works</label>
                    <textarea
                      rows={3}
                      value={editForm.working}
                      onChange={(e) => setEditForm({ ...editForm, working: e.target.value })}
                      className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1.5 block">Project Image</label>
                    {editForm.image && (
                      <div className="mb-2 rounded-lg overflow-hidden h-32">
                        <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all cursor-pointer text-xs font-mono">
                      <Image className="w-3 h-3" /> Upload Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-1.5 block">Color Theme</label>
                    <div className="flex gap-2 flex-wrap">
                      {gradientOptions.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, gradient: g })}
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} border-2 transition-all ${editForm.gradient === g ? "border-foreground scale-110" : "border-transparent"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg flex items-center justify-center gap-2 neon-glow-purple transition-all"
                  >
                    <Save className="w-4 h-4" /> Save Project
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsSection;
