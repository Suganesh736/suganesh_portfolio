import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { BookOpen, Pencil, Plus, Trash2, X, Download } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface Subject {
  name: string;
  marks: number;
  maxMarks: number;
}

interface Semester {
  name: string;
  subjects: Subject[];
}

const defaultSemesters: Semester[] = [
  {
    name: "Semester 1",
    subjects: [
      { name: "Mathematics I", marks: 85, maxMarks: 100 },
      { name: "Physics", marks: 78, maxMarks: 100 },
      { name: "Chemistry", marks: 82, maxMarks: 100 },
      { name: "English", marks: 90, maxMarks: 100 },
      { name: "Engineering Graphics", marks: 88, maxMarks: 100 },
    ],
  },
  {
    name: "Semester 2",
    subjects: [
      { name: "Mathematics II", marks: 80, maxMarks: 100 },
      { name: "Programming in C", marks: 92, maxMarks: 100 },
      { name: "Electrical Engineering", marks: 75, maxMarks: 100 },
      { name: "Environmental Science", marks: 88, maxMarks: 100 },
      { name: "Workshop Practice", marks: 85, maxMarks: 100 },
    ],
  },
];

const loadMarksheet = (): Semester[] => {
  try {
    const d = localStorage.getItem("portfolio_marksheet");
    return d ? JSON.parse(d) : defaultSemesters;
  } catch {
    return defaultSemesters;
  }
};

const saveMarksheet = (data: Semester[]) =>
  localStorage.setItem("portfolio_marksheet", JSON.stringify(data));

const MarksheetSection = () => {
  const [semesters, setSemesters] = useState<Semester[]>(loadMarksheet);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Semester[]>([]);
  const { requestAuth } = useAdmin();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const openEdit = () =>
    requestAuth(() => {
      setEditData(JSON.parse(JSON.stringify(semesters)));
      setEditMode(true);
    });

  const handleSave = () => {
    setSemesters(editData);
    saveMarksheet(editData);
    setEditMode(false);
  };

  const getTotalMarks = (subjects: Subject[]) =>
    subjects.reduce((a, s) => a + s.marks, 0);
  const getTotalMax = (subjects: Subject[]) =>
    subjects.reduce((a, s) => a + s.maxMarks, 0);
  const getPercentage = (subjects: Subject[]) =>
    ((getTotalMarks(subjects) / getTotalMax(subjects)) * 100).toFixed(1);

  const handleDownloadPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    let html = `<html><head><title>Marksheet - Suganesh</title><style>
      body{font-family:Arial,sans-serif;padding:40px;color:#333}
      h1{text-align:center;color:#7c3aed}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{border:1px solid #ddd;padding:10px;text-align:left}
      th{background:#7c3aed;color:white}
      .total{font-weight:bold;background:#f3f4f6}
    </style></head><body><h1>Marksheet — Suganesh</h1>`;
    semesters.forEach((sem) => {
      html += `<h2>${sem.name}</h2><table><tr><th>Subject</th><th>Marks</th><th>Max</th></tr>`;
      sem.subjects.forEach((s) => {
        html += `<tr><td>${s.name}</td><td>${s.marks}</td><td>${s.maxMarks}</td></tr>`;
      });
      html += `<tr class="total"><td>Total</td><td>${getTotalMarks(sem.subjects)}</td><td>${getTotalMax(sem.subjects)}</td></tr>`;
      html += `<tr class="total"><td colspan="2">Percentage</td><td>${getPercentage(sem.subjects)}%</td></tr></table>`;
    });
    html += "</body></html>";
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const updateSubject = (si: number, sj: number, key: keyof Subject, value: string | number) => {
    const d = [...editData];
    (d[si].subjects[sj] as any)[key] = value;
    setEditData(d);
  };

  const addSubject = (si: number) => {
    const d = [...editData];
    d[si].subjects.push({ name: "New Subject", marks: 0, maxMarks: 100 });
    setEditData(d);
  };

  const removeSubject = (si: number, sj: number) => {
    const d = [...editData];
    d[si].subjects.splice(sj, 1);
    setEditData(d);
  };

  const addSemester = () => {
    setEditData([...editData, { name: `Semester ${editData.length + 1}`, subjects: [] }]);
  };

  const removeSemester = (si: number) => {
    const d = [...editData];
    d.splice(si, 1);
    setEditData(d);
  };

  return (
    <section id="marksheet" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-[100px]" />
      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-secondary font-mono text-sm tracking-widest uppercase mb-2">Academic Record</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold gradient-text">Marksheet</h2>

          <div className="flex justify-center gap-3 mt-4">
            <button onClick={openEdit} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-muted/30 border border-glass-border/30 rounded-lg text-muted-foreground hover:text-primary transition-all">
              <Pencil className="w-3 h-3" /> Edit Marksheet
            </button>
            <button onClick={handleDownloadPdf} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all">
              <Download className="w-3 h-3" /> Download PDF
            </button>
          </div>
        </motion.div>

        <div className="space-y-8">
          {semesters.map((sem, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + si * 0.15 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">{sem.name}</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-glass-border/30">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Subject</th>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">Marks</th>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">Max</th>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.subjects.map((sub, sj) => (
                      <tr key={sj} className="border-b border-glass-border/10 hover:bg-muted/10 transition-colors">
                        <td className="py-2 px-3 text-foreground">{sub.name}</td>
                        <td className="py-2 px-3 text-center text-foreground">{sub.marks}</td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{sub.maxMarks}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`font-mono text-xs px-2 py-0.5 rounded ${(sub.marks / sub.maxMarks) * 100 >= 75 ? "bg-green-500/10 text-green-400" : (sub.marks / sub.maxMarks) * 100 >= 50 ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                            {((sub.marks / sub.maxMarks) * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-glass-border/30 font-semibold">
                      <td className="py-2 px-3 text-foreground">Total</td>
                      <td className="py-2 px-3 text-center text-primary">{getTotalMarks(sem.subjects)}</td>
                      <td className="py-2 px-3 text-center text-muted-foreground">{getTotalMax(sem.subjects)}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {getPercentage(sem.subjects)}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setEditMode(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card neon-glow-purple p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold gradient-text">Edit Marksheet</h3>
                <button onClick={() => setEditMode(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-6">
                {editData.map((sem, si) => (
                  <div key={si} className="border border-glass-border/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input value={sem.name} onChange={(e) => { const d = [...editData]; d[si].name = e.target.value; setEditData(d); }} className="flex-1 px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50" />
                      <button onClick={() => removeSemester(si)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    {sem.subjects.map((sub, sj) => (
                      <div key={sj} className="flex gap-2 mb-2">
                        <input value={sub.name} onChange={(e) => updateSubject(si, sj, "name", e.target.value)} placeholder="Subject" className="flex-1 px-3 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs focus:outline-none focus:border-primary/50" />
                        <input type="number" value={sub.marks} onChange={(e) => updateSubject(si, sj, "marks", Number(e.target.value))} className="w-16 px-2 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs text-center focus:outline-none focus:border-primary/50" />
                        <input type="number" value={sub.maxMarks} onChange={(e) => updateSubject(si, sj, "maxMarks", Number(e.target.value))} className="w-16 px-2 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs text-center focus:outline-none focus:border-primary/50" />
                        <button onClick={() => removeSubject(si, sj)} className="text-destructive/60 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => addSubject(si)} className="text-xs text-primary font-mono flex items-center gap-1 mt-2 hover:underline"><Plus className="w-3 h-3" /> Add Subject</button>
                  </div>
                ))}

                <button onClick={addSemester} className="w-full py-2 text-xs font-mono text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> Add Semester
                </button>
              </div>

              <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-6 py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg neon-glow-purple transition-all">
                Save Changes
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MarksheetSection;
