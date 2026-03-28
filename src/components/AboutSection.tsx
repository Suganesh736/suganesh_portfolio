import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Cpu, Zap, Wifi, GraduationCap, Pencil, X, Save, Plus, Trash2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { loadContent, saveContent } from "@/lib/portfolio-db";

const defaultTimeline = [
  { year: "2023", title: "Started Engineering", subtitle: "College of Engineering", desc: "Began B.E. journey with a focus on electronics and embedded systems" },
  { year: "2023", title: "First IoT Project", subtitle: "", desc: "Built a Line Follower Robot using Arduino and IR sensors" },
  { year: "2024", title: "Advanced Projects", subtitle: "", desc: "Developed accident detection systems and smart parking solutions" },
  { year: "Present", title: "IoT Innovator", subtitle: "", desc: "Continuing to build real-world hardware + IoT solutions" },
];

const defaultBio = {
  para1: "I'm Suganesh, a second-year engineering student with an intense passion for embedded systems and IoT development. I believe in bridging the gap between software and hardware to create impactful, real-world solutions.",
  para2: "From building line-following robots to accident detection systems, I work with Arduino, ESP32, ESP8266, and various sensors to prototype innovative hardware solutions that solve real problems.",
};

const defaultAbout = { bio: defaultBio, timeline: defaultTimeline };
const emptyEntry = { year: "", title: "", subtitle: "", desc: "" };

const AboutSection = () => {
  const [data, setData] = useState(defaultAbout);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(defaultAbout);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { requestAuth } = useAdmin();

  useEffect(() => {
    loadContent("about", defaultAbout).then(d => {
      // Ensure subtitle field exists on migrated data
      const timeline = (d.timeline || []).map((t: any) => ({ subtitle: "", ...t }));
      setData({ ...d, timeline });
    });
  }, []);

  const openEdit = () => {
    requestAuth(() => {
      setEditData(JSON.parse(JSON.stringify(data)));
      setEditMode(true);
    });
  };

  const handleAddEntry = () => {
    requestAuth(() => {
      setEditData(prev => ({ ...prev, timeline: [...prev.timeline, { ...emptyEntry }] }));
      if (!editMode) {
        setEditData(prev => {
          const d = JSON.parse(JSON.stringify(data));
          d.timeline.push({ ...emptyEntry });
          return d;
        });
        setEditMode(true);
      }
    });
  };

  const handleDeleteEntry = (index: number) => {
    requestAuth(() => {
      if (editMode) {
        setEditData(prev => ({ ...prev, timeline: prev.timeline.filter((_, i) => i !== index) }));
      }
    });
  };

  const handleSave = async () => {
    setData(editData);
    setEditMode(false);
    await saveContent("about", editData);
  };

  const updateTimeline = (index: number, field: string, value: string) => {
    setEditData(prev => {
      const t = [...prev.timeline];
      t[index] = { ...t[index], [field]: value };
      return { ...prev, timeline: t };
    });
  };

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
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <button
              onClick={openEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-muted/30 border border-glass-border/30 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
            >
              <Pencil className="w-3 h-3" /> Edit About
            </button>
            <button
              onClick={handleAddEntry}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all"
            >
              <Plus className="w-3 h-3" /> Add Timeline Entry
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Bio Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="glass-card p-8 neon-glow-purple">
              <p className="font-body text-foreground/80 leading-relaxed mb-6">{data.bio.para1}</p>
              <p className="font-body text-foreground/70 leading-relaxed mb-8">{data.bio.para2}</p>
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
            {data.timeline.map((item: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary neon-glow-purple flex-shrink-0 mt-1.5" />
                  {i < data.timeline.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent mt-1" />}
                </div>
                <div className="glass-card p-5 flex-1 hover:border-primary/30 transition-colors">
                  <span className="text-primary font-mono text-xs tracking-wider">{item.year}</span>
                  <h4 className="font-display text-sm font-semibold mt-1">{item.title}</h4>
                  {item.subtitle && <p className="font-body text-xs text-primary/70 mt-0.5">{item.subtitle}</p>}
                  <p className="font-body text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
                <h3 className="font-display text-lg font-bold gradient-text">Edit About & Timeline</h3>
                <button onClick={() => setEditMode(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1.5 block">Bio - Paragraph 1</label>
                  <textarea
                    rows={3}
                    value={editData.bio.para1}
                    onChange={(e) => setEditData({ ...editData, bio: { ...editData.bio, para1: e.target.value } })}
                    className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1.5 block">Bio - Paragraph 2</label>
                  <textarea
                    rows={3}
                    value={editData.bio.para2}
                    onChange={(e) => setEditData({ ...editData, bio: { ...editData.bio, para2: e.target.value } })}
                    className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <h4 className="font-display text-sm font-semibold gradient-text">Timeline Entries</h4>
                  <button
                    onClick={() => setEditData(prev => ({ ...prev, timeline: [...prev.timeline, { ...emptyEntry }] }))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                {editData.timeline.map((item: any, i: number) => (
                  <div key={i} className="glass-card p-4 space-y-2 relative group">
                    <button
                      onClick={() => handleDeleteEntry(i)}
                      className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex gap-2">
                      <input
                        value={item.year}
                        onChange={(e) => updateTimeline(i, "year", e.target.value)}
                        placeholder="Year"
                        className="w-24 px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-mono text-xs focus:outline-none focus:border-primary/50 transition-all"
                      />
                      <input
                        value={item.title}
                        onChange={(e) => updateTimeline(i, "title", e.target.value)}
                        placeholder="Title"
                        className="flex-1 px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-xs focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                    <input
                      value={item.subtitle || ""}
                      onChange={(e) => updateTimeline(i, "subtitle", e.target.value)}
                      placeholder="Subtitle (e.g., College Name)"
                      className="w-full px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-xs focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <input
                      value={item.desc}
                      onChange={(e) => updateTimeline(i, "desc", e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-xs focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg flex items-center justify-center gap-2 neon-glow-purple transition-all"
              >
                <Save className="w-4 h-4" /> Save Changes
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AboutSection;
