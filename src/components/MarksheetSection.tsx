import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { BookOpen, Pencil, Plus, Trash2, X, Download, GraduationCap, School, Save } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { loadContent, saveContent } from "@/lib/portfolio-db";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ───────── Types ───────── */
interface SubjectMark {
  name: string;
  marks: number;
  maxMarks: number;
}

interface SchoolRecord {
  label: string;
  schoolName: string;
  board: string;
  yearOfPassing: string;
  subjects: SubjectMark[];
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
    {
      label: "10th Standard",
      schoolName: "Government Higher Secondary School",
      board: "State Board",
      yearOfPassing: "2021",
      subjects: [
        { name: "Tamil", marks: 85, maxMarks: 100 },
        { name: "English", marks: 78, maxMarks: 100 },
        { name: "Mathematics", marks: 92, maxMarks: 100 },
        { name: "Science", marks: 88, maxMarks: 100 },
        { name: "Social Science", marks: 82, maxMarks: 100 },
      ],
    },
    {
      label: "11th Standard",
      schoolName: "Government Higher Secondary School",
      board: "State Board",
      yearOfPassing: "2022",
      subjects: [
        { name: "Tamil", marks: 80, maxMarks: 100 },
        { name: "English", marks: 75, maxMarks: 100 },
        { name: "Physics", marks: 82, maxMarks: 100 },
        { name: "Chemistry", marks: 78, maxMarks: 100 },
        { name: "Mathematics", marks: 85, maxMarks: 100 },
      ],
    },
    {
      label: "12th Standard",
      schoolName: "Government Higher Secondary School",
      board: "State Board",
      yearOfPassing: "2023",
      subjects: [
        { name: "Tamil", marks: 90, maxMarks: 100 },
        { name: "English", marks: 85, maxMarks: 100 },
        { name: "Physics", marks: 88, maxMarks: 100 },
        { name: "Chemistry", marks: 90, maxMarks: 100 },
        { name: "Mathematics", marks: 95, maxMarks: 100 },
      ],
    },
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

/* helpers */
const calcTotal = (subjects: SubjectMark[]) => subjects.reduce((a, s) => a + s.marks, 0);
const calcMax = (subjects: SubjectMark[]) => subjects.reduce((a, s) => a + s.maxMarks, 0);
const calcPct = (subjects: SubjectMark[]) => {
  const max = calcMax(subjects);
  return max > 0 ? ((calcTotal(subjects) / max) * 100).toFixed(1) : "0.0";
};

/* ───────── Component ───────── */
const MarksheetSection = () => {
  const [data, setData] = useState<MarksheetData>(defaultData);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<MarksheetData>(defaultData);
  const { requestAuth } = useAdmin();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    loadContent<MarksheetData>("marksheet_v3", defaultData).then((d) => {
      // migrate old format
      const school = (d.school || []).map((r: any) => ({
        schoolName: r.schoolName || "",
        board: r.board || "",
        yearOfPassing: r.yearOfPassing || "",
        label: r.label || "",
        subjects: Array.isArray(r.subjects) && r.subjects.length > 0 && typeof r.subjects[0] === "object"
          ? r.subjects
          : (r.subjects || []).map((name: string) => ({ name, marks: 0, maxMarks: 100 })),
      }));
      setData({ ...d, school });
    });
  }, []);

  const openEdit = () =>
    requestAuth(() => {
      setEditData(JSON.parse(JSON.stringify(data)));
      setEditMode(true);
    });

  const handleSave = async () => {
    setData(editData);
    setEditMode(false);
    await saveContent("marksheet_v3", editData);
  };

  /* ── PDF ── */
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const purple: [number, number, number] = [124, 58, 237];
    doc.setFontSize(20);
    doc.setTextColor(...purple);
    doc.text("Academic Record — Suganesh", 105, 20, { align: "center" });
    let y = 30;

    doc.setFontSize(14);
    doc.setTextColor(...purple);
    doc.text("School Records", 14, y);
    y += 6;

    data.school.forEach((rec) => {
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`${rec.schoolName} | ${rec.board} | ${rec.yearOfPassing}`, 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [[rec.label + " — Subject", "Marks", "Max", "%"]],
        body: rec.subjects.map((s) => [s.name, s.marks.toString(), s.maxMarks.toString(), ((s.marks / s.maxMarks) * 100).toFixed(1) + "%"]),
        foot: [[`Total: ${calcTotal(rec.subjects)}/${calcMax(rec.subjects)}`, "", "", `${calcPct(rec.subjects)}%`]],
        theme: "grid",
        headStyles: { fillColor: purple, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        footStyles: { fillColor: [245, 245, 255], textColor: purple, fontStyle: "bold", fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
      if (y > 260) { doc.addPage(); y = 20; }
    });

    doc.setFontSize(14);
    doc.setTextColor(...purple);
    doc.text("College Semesters", 14, y);
    y += 6;

    data.college.forEach((sem) => {
      autoTable(doc, {
        startY: y,
        head: [["Subject", "Marks", "Max", "%"]],
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
  const updateSchoolField = (i: number, field: string, val: string) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      (d.school[i] as any)[field] = val;
      return d;
    });
  };

  const updateSchoolSubject = (i: number, j: number, field: keyof SubjectMark, val: string | number) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      (d.school[i].subjects[j] as any)[field] = val;
      return d;
    });
  };

  const addSchoolSubject = (i: number) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      d.school[i].subjects.push({ name: "New Subject", marks: 0, maxMarks: 100 });
      return d;
    });
  };

  const removeSchoolSubject = (i: number, j: number) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      d.school[i].subjects.splice(j, 1);
      return d;
    });
  };

  const updateCollegeSubject = (si: number, sj: number, key: keyof CollegeSubject, val: string | number) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      (d.college[si].subjects[sj] as any)[key] = val;
      return d;
    });
  };

  const addCollegeSubject = (si: number) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      d.college[si].subjects.push({ name: "New Subject", marks: 0, maxMarks: 100 });
      return d;
    });
  };

  const removeCollegeSubject = (si: number, sj: number) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      d.college[si].subjects.splice(sj, 1);
      return d;
    });
  };

  const addSemester = () => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      d.college.push({ name: `Semester ${d.college.length + 1}`, subjects: [], sgpa: 0, cgpa: 0 });
      return d;
    });
  };

  const removeSemester = (si: number) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      d.college.splice(si, 1);
      return d;
    });
  };

  /* ───── input classes ───── */
  const inp = "px-3 py-1.5 bg-muted/30 border border-glass-border/30 rounded text-foreground font-body text-xs focus:outline-none focus:border-primary/50 transition-all";

  return (
    <section id="marksheet" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-[100px]" />
      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="text-center mb-12">
          <p className="text-secondary font-mono text-sm tracking-widest uppercase mb-2">Academic Record</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold gradient-text">Education & Marksheet</h2>
          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <button onClick={openEdit} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-muted/30 border border-glass-border/30 rounded-lg text-muted-foreground hover:text-primary transition-all">
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <motion.button onClick={handleDownloadPdf} whileHover={{ scale: 1.05, boxShadow: "0 0 20px hsl(var(--primary)/0.4)" }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all">
              <Download className="w-3 h-3" /> Download PDF
            </motion.button>
          </div>
        </motion.div>

        {/* ═══ School Records ═══ */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <School className="w-5 h-5 text-secondary" />
            <h3 className="font-display text-xl font-bold text-foreground">School Records</h3>
          </div>
          <div className="space-y-6">
            {data.school.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.1 }} className="glass-card p-6 hover:neon-glow-purple transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h4 className="font-display text-lg font-bold text-primary">{rec.label}</h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.schoolName && (
                      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-muted/30 border border-glass-border/20 text-muted-foreground">{rec.schoolName}</span>
                    )}
                    {rec.board && (
                      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">{rec.board}</span>
                    )}
                    {rec.yearOfPassing && (
                      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">{rec.yearOfPassing}</span>
                    )}
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
                      {rec.subjects.map((sub, j) => (
                        <tr key={j} className="border-b border-glass-border/10 hover:bg-muted/10 transition-colors">
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
                      <tr className="border-t border-glass-border/30">
                        <td className="py-2 px-3 font-semibold text-foreground">Total</td>
                        <td className="py-2 px-3 text-center font-bold text-primary">{calcTotal(rec.subjects)}</td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{calcMax(rec.subjects)}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">{calcPct(rec.subjects)}%</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══ College Semesters ═══ */}
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

      {/* ═══ Edit Modal ═══ */}
      <AnimatePresence>
        {editMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setEditMode(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card neon-glow-purple p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto scrollbar-hide">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold gradient-text">Edit Marksheet</h3>
                <button onClick={() => setEditMode(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              {/* School */}
              <h4 className="font-display text-sm font-bold text-secondary mb-3">School Records (Subject-wise)</h4>
              <div className="space-y-4 mb-6">
                {editData.school.map((rec, i) => (
                  <div key={i} className="border border-glass-border/20 rounded-lg p-4 space-y-3">
                    <input value={rec.label} onChange={(e) => updateSchoolField(i, "label", e.target.value)} className={`w-full font-semibold ${inp}`} placeholder="e.g. 10th Standard" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input value={rec.schoolName} onChange={(e) => updateSchoolField(i, "schoolName", e.target.value)} className={inp} placeholder="School Name" />
                      <input value={rec.board} onChange={(e) => updateSchoolField(i, "board", e.target.value)} className={inp} placeholder="Board (State/CBSE)" />
                      <input value={rec.yearOfPassing} onChange={(e) => updateSchoolField(i, "yearOfPassing", e.target.value)} className={inp} placeholder="Year of Passing" />
                    </div>

                    <p className="text-xs text-muted-foreground font-mono">Subjects & Marks</p>
                    {rec.subjects.map((sub, j) => (
                      <div key={j} className="flex gap-2 items-center">
                        <input value={sub.name} onChange={(e) => updateSchoolSubject(i, j, "name", e.target.value)} placeholder="Subject" className={`flex-1 ${inp}`} />
                        <input type="number" value={sub.marks} onChange={(e) => updateSchoolSubject(i, j, "marks", Number(e.target.value))} className={`w-16 text-center ${inp}`} />
                        <span className="text-muted-foreground text-xs">/</span>
                        <input type="number" value={sub.maxMarks} onChange={(e) => updateSchoolSubject(i, j, "maxMarks", Number(e.target.value))} className={`w-16 text-center ${inp}`} />
                        <button onClick={() => removeSchoolSubject(i, j)} className="text-destructive/60 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => addSchoolSubject(i)} className="text-xs text-primary font-mono flex items-center gap-1 hover:underline">
                      <Plus className="w-3 h-3" /> Add Subject
                    </button>
                    <div className="text-xs text-muted-foreground font-mono border-t border-glass-border/20 pt-2">
                      Auto Total: {calcTotal(rec.subjects)}/{calcMax(rec.subjects)} ({calcPct(rec.subjects)}%)
                    </div>
                  </div>
                ))}
              </div>

              {/* College */}
              <h4 className="font-display text-sm font-bold text-primary mb-3">College Semesters</h4>
              <div className="space-y-4">
                {editData.college.map((sem, si) => (
                  <div key={si} className="border border-glass-border/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input value={sem.name} onChange={(e) => { const d = JSON.parse(JSON.stringify(editData)); d.college[si].name = e.target.value; setEditData(d); }} className={`flex-1 ${inp}`} />
                      <button onClick={() => removeSemester(si)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground font-mono">SGPA</label>
                        <input type="number" step="0.01" value={sem.sgpa} onChange={(e) => { const d = JSON.parse(JSON.stringify(editData)); d.college[si].sgpa = Number(e.target.value); setEditData(d); }} className={`w-full text-center ${inp}`} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground font-mono">CGPA</label>
                        <input type="number" step="0.01" value={sem.cgpa} onChange={(e) => { const d = JSON.parse(JSON.stringify(editData)); d.college[si].cgpa = Number(e.target.value); setEditData(d); }} className={`w-full text-center ${inp}`} />
                      </div>
                    </div>
                    {sem.subjects.map((sub, sj) => (
                      <div key={sj} className="flex gap-2 mb-2 items-center">
                        <input value={sub.name} onChange={(e) => updateCollegeSubject(si, sj, "name", e.target.value)} placeholder="Subject" className={`flex-1 ${inp}`} />
                        <input type="number" value={sub.marks} onChange={(e) => updateCollegeSubject(si, sj, "marks", Number(e.target.value))} className={`w-16 text-center ${inp}`} />
                        <input type="number" value={sub.maxMarks} onChange={(e) => updateCollegeSubject(si, sj, "maxMarks", Number(e.target.value))} className={`w-16 text-center ${inp}`} />
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

              <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-6 py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg flex items-center justify-center gap-2 neon-glow-purple transition-all">
                <Save className="w-4 h-4" /> Save Changes
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MarksheetSection;
