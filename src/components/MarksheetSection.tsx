import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { BookOpen, Pencil, Plus, Trash2, X, Download, GraduationCap, School } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ───────── Types ───────── */
interface SchoolRecord {
  label: string; // "10th", "11th", "12th"
  subjects: string[];
  totalMarks: number;
  maxMarks: number;
}

interface CollegeSubject {
  name: string;
  marks: number;
  maxMarks: number;
}

interface CollegeSemester {
  name: string;
  subjects: CollegeSubject[];
  sgpa: number;
  cgpa: number;
}

interface MarksheetData {
  school: SchoolRecord[];
  college: CollegeSemester[];
}

/* ───────── Defaults ───────── */
const defaultData: MarksheetData = {
  school: [
    { label: "10th Standard", subjects: ["Tamil", "English", "Mathematics", "Science", "Social Science"], totalMarks: 425, maxMarks: 500 },
    { label: "11th Standard", subjects: ["Tamil", "English", "Physics", "Chemistry", "Mathematics"], totalMarks: 410, maxMarks: 500 },
    { label: "12th Standard", subjects: ["Tamil", "English", "Physics", "Chemistry", "Mathematics"], totalMarks: 450, maxMarks: 500 },
  ],
  college: [
    {
      name: "Semester 1",
      subjects: [
        { name: "Mathematics I", marks: 85, maxMarks: 100 },
        { name: "Physics", marks: 78, maxMarks: 100 },
        { name: "Chemistry", marks: 82, maxMarks: 100 },
        { name: "English", marks: 90, maxMarks: 100 },
        { name: "Engineering Graphics", marks: 88, maxMarks: 100 },
      ],
      sgpa: 8.2,
      cgpa: 8.2,
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
      sgpa: 8.5,
      cgpa: 8.35,
    },
  ],
};

const load = (): MarksheetData => {
  try {
    const d = localStorage.getItem("portfolio_marksheet_v2");
    return d ? JSON.parse(d) : defaultData;
  } catch {
    return defaultData;
  }
};
const save = (d: MarksheetData) => localStorage.setItem("portfolio_marksheet_v2", JSON.stringify(d));

/* ───────── Component ───────── */
const MarksheetSection = () => {
  const [data, setData] = useState<MarksheetData>(load);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<MarksheetData>(defaultData);
  const { requestAuth } = useAdmin();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const openEdit = () =>
    requestAuth(() => {
      setEditData(JSON.parse(JSON.stringify(data)));
      setEditMode(true);
    });

  const handleSave = () => {
    setData(editData);
    save(editData);
    setEditMode(false);
  };

  /* ── PDF Generation ── */
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const purple = [124, 58, 237];

    doc.setFontSize(20);
    doc.setTextColor(purple[0], purple[1], purple[2]);
    doc.text("Academic Record — Suganesh", 105, 20, { align: "center" });

    let y = 30;

    // School records
    doc.setFontSize(14);
    doc.setTextColor(purple[0], purple[1], purple[2]);
    doc.text("School Records", 14, y);
    y += 6;

    data.school.forEach((rec) => {
      autoTable(doc, {
        startY: y,
        head: [[rec.label, "Subjects", `Total: ${rec.totalMarks}/${rec.maxMarks} (${((rec.totalMarks / rec.maxMarks) * 100).toFixed(1)}%)`]],
        body: [[{ content: rec.subjects.join(", "), colSpan: 3 }]],
        theme: "grid",
        headStyles: { fillColor: purple, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    });

    // College records
    doc.setFontSize(14);
    doc.setTextColor(purple[0], purple[1], purple[2]);
    doc.text("College Semesters", 14, y);
    y += 6;

    data.college.forEach((sem) => {
      autoTable(doc, {
        startY: y,
        head: [["Subject", "Marks", "Max Marks", "%"]],
        body: sem.subjects.map((s) => [s.name, s.marks.toString(), s.maxMarks.toString(), ((s.marks / s.maxMarks) * 100).toFixed(1) + "%"]),
        foot: [[`SGPA: ${sem.sgpa}`, `CGPA: ${sem.cgpa}`, "", ""]],
        theme: "grid",
        headStyles: { fillColor: purple, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        footStyles: { fillColor: [245, 245, 255], textColor: purple, fontStyle: "bold", fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
      if (y > 260) { doc.addPage(); y = 20; }
    });

    doc.save("Marksheet_Suganesh.pdf");
  };

  /* ── Edit helpers ── */
  const updateSchool = (i: number, key: keyof SchoolRecord, val: any) => {
    const d = JSON.parse(JSON.stringify(editData));
    (d.school[i] as any)[key] = val;
    setEditData(d);
  };

  const updateCollegeSubject = (si: number, sj: number, key: keyof CollegeSubject, val: string | number) => {
    const d = JSON.parse(JSON.stringify(editData));
    (d.college[si].subjects[sj] as any)[key] = val;
    setEditData(d);
  };

  const addCollegeSubject = (si: number) => {
    const d = JSON.parse(JSON.stringify(editData));
    d.college[si].subjects.push({ name: "New Subject", marks: 0, maxMarks: 100 });
    setEditData(d);
  };

  const removeCollegeSubject = (si: number, sj: number) => {
    const d = JSON.parse(JSON.stringify(editData));
    d.college[si].subjects.splice(sj, 1);
    setEditData(d);
  };

  const addSemester = () => {
    const d = JSON.parse(JSON.stringify(editData));
    d.college.push({ name: `Semester ${d.college.length + 1}`, subjects: [], sgpa: 0, cgpa: 0 });
    setEditData(d);
  };

  const removeSemester = (si: number) => {
    const d = JSON.parse(JSON.stringify(editData));
    d.college.splice(si, 1);
    setEditData(d);
  };

  return (
    <section id="marksheet" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-[100px]" />
      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="text-center mb-12">
          <p className="text-secondary font-mono text-sm tracking-widest uppercase mb-2">Academic Record</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold gradient-text">Education & Marksheet</h2>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={openEdit} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-muted/30 border border-glass-border/30 rounded-lg text-muted-foreground hover:text-primary transition-all">
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <motion.button onClick={handleDownloadPdf} whileHover={{ scale: 1.05, boxShadow: "0 0 20px hsl(var(--primary)/0.4)" }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all">
              <Download className="w-3 h-3" /> Download PDF
            </motion.button>
          </div>
        </motion.div>

        {/* ── School Records ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <School className="w-5 h-5 text-secondary" />
            <h3 className="font-display text-xl font-bold text-foreground">School Records</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {data.school.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.1 }} className="glass-card p-5 hover:neon-glow-purple transition-all duration-300">
                <h4 className="font-display text-lg font-bold text-primary mb-3">{rec.label}</h4>
                <div className="space-y-1.5 mb-4">
                  {rec.subjects.map((s, j) => (
                    <p key={j} className="text-sm text-muted-foreground font-body flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60" /> {s}
                    </p>
                  ))}
                </div>
                <div className="border-t border-glass-border/20 pt-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-mono">Total</span>
                  <span className="font-display font-bold text-primary">{rec.totalMarks}<span className="text-muted-foreground text-xs">/{rec.maxMarks}</span></span>
                </div>
                <div className="mt-1 text-right">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {((rec.totalMarks / rec.maxMarks) * 100).toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── College Semesters ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl font-bold text-foreground">College Semesters</h3>
          </div>
          <div className="space-y-6">
            {data.college.map((sem, si) => (
              <motion.div key={si} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 + si * 0.15 }} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h4 className="font-display text-lg font-bold text-foreground">{sem.name}</h4>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">SGPA: {sem.sgpa}</span>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">CGPA: {sem.cgpa}</span>
                  </div>
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
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setEditMode(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card neon-glow-purple p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold gradient-text">Edit Marksheet</h3>
                <button onClick={() => setEditMode(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              {/* School Editing */}
              <h4 className="font-display text-sm font-bold text-secondary mb-3">School Records</h4>
              <div className="space-y-4 mb-6">
                {editData.school.map((rec, i) => (
                  <div key={i} className="border border-glass-border/20 rounded-lg p-4">
                    <input value={rec.label} onChange={(e) => updateSchool(i, "label", e.target.value)} className="w-full mb-2 px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50" />
                    <label className="text-xs text-muted-foreground font-mono mb-1 block">Subjects (comma separated)</label>
                    <input value={rec.subjects.join(", ")} onChange={(e) => updateSchool(i, "subjects", e.target.value.split(",").map((s) => s.trim()))} className="w-full mb-2 px-3 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs focus:outline-none focus:border-primary/50" />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground font-mono">Total Marks</label>
                        <input type="number" value={rec.totalMarks} onChange={(e) => updateSchool(i, "totalMarks", Number(e.target.value))} className="w-full px-3 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs text-center focus:outline-none focus:border-primary/50" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground font-mono">Max Marks</label>
                        <input type="number" value={rec.maxMarks} onChange={(e) => updateSchool(i, "maxMarks", Number(e.target.value))} className="w-full px-3 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs text-center focus:outline-none focus:border-primary/50" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* College Editing */}
              <h4 className="font-display text-sm font-bold text-primary mb-3">College Semesters</h4>
              <div className="space-y-4">
                {editData.college.map((sem, si) => (
                  <div key={si} className="border border-glass-border/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input value={sem.name} onChange={(e) => { const d = JSON.parse(JSON.stringify(editData)); d.college[si].name = e.target.value; setEditData(d); }} className="flex-1 px-3 py-2 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50" />
                      <button onClick={() => removeSemester(si)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground font-mono">SGPA</label>
                        <input type="number" step="0.01" value={sem.sgpa} onChange={(e) => { const d = JSON.parse(JSON.stringify(editData)); d.college[si].sgpa = Number(e.target.value); setEditData(d); }} className="w-full px-3 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs text-center focus:outline-none focus:border-primary/50" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground font-mono">CGPA</label>
                        <input type="number" step="0.01" value={sem.cgpa} onChange={(e) => { const d = JSON.parse(JSON.stringify(editData)); d.college[si].cgpa = Number(e.target.value); setEditData(d); }} className="w-full px-3 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs text-center focus:outline-none focus:border-primary/50" />
                      </div>
                    </div>
                    {sem.subjects.map((sub, sj) => (
                      <div key={sj} className="flex gap-2 mb-2">
                        <input value={sub.name} onChange={(e) => updateCollegeSubject(si, sj, "name", e.target.value)} placeholder="Subject" className="flex-1 px-3 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs focus:outline-none focus:border-primary/50" />
                        <input type="number" value={sub.marks} onChange={(e) => updateCollegeSubject(si, sj, "marks", Number(e.target.value))} className="w-16 px-2 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs text-center focus:outline-none focus:border-primary/50" />
                        <input type="number" value={sub.maxMarks} onChange={(e) => updateCollegeSubject(si, sj, "maxMarks", Number(e.target.value))} className="w-16 px-2 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs text-center focus:outline-none focus:border-primary/50" />
                        <button onClick={() => removeCollegeSubject(si, sj)} className="text-destructive/60 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => addCollegeSubject(si)} className="text-xs text-primary font-mono flex items-center gap-1 mt-2 hover:underline"><Plus className="w-3 h-3" /> Add Subject</button>
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
