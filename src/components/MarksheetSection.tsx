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

// மார்க்கிற்கு பதில் கிரேடு (Grade) சேர்க்கப்பட்டுள்ளது
interface CollegeSubject {
  name: string;
  grade: string; 
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
        { name: "Mathematics I", grade: "O" },
        { name: "Physics", grade: "A+" },
        { name: "Chemistry", grade: "A" },
        { name: "English", grade: "O" },
        { name: "Engineering Graphics", grade: "B+" },
      ],
      sgpa: 8.2,
      cgpa: 8.2,
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
      setData(d);
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
      autoTable(doc, {
        startY: y,
        head: [[rec.label + " — Subject", "Marks", "Max", "%"]],
        body: rec.subjects.map((s) => [s.name, s.marks.toString(), s.maxMarks.toString(), ((s.marks / s.maxMarks) * 100).toFixed(1) + "%"]),
        theme: "grid",
        headStyles: { fillColor: purple },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    });

    doc.text("College Semesters", 14, y);
    y += 6;

    data.college.forEach((sem) => {
      autoTable(doc, {
        startY: y,
        head: [["Subject", "Grade"]],
        body: sem.subjects.map((s) => [s.name, s.grade]),
        foot: [[`SGPA: ${sem.sgpa}`, `CGPA: ${sem.cgpa}`]],
        theme: "grid",
        headStyles: { fillColor: purple },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
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

  // காலேஜ் கிரேடு அப்டேட் செய்ய
  const updateCollegeSubject = (si: number, sj: number, key: keyof CollegeSubject, val: string) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      (d.college[si].subjects[sj] as any)[key] = val;
      return d;
    });
  };

  const addCollegeSubject = (si: number) => {
    setEditData((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      d.college[si].subjects.push({ name: "New Subject", grade: "A" });
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
            <button onClick={handleDownloadPdf} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all">
              <Download className="w-3 h-3" /> Download PDF
            </button>
          </div>
        </motion.div>

        {/* ═══ School Records (No Change) ═══ */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <School className="w-5 h-5 text-secondary" />
            <h3 className="font-display text-xl font-bold text-foreground">School Records</h3>
          </div>
          <div className="space-y-6">
            {data.school.map((rec, i) => (
              <div key={i} className="glass-card p-6">
                <h4 className="font-display text-lg font-bold text-primary mb-4">{rec.label}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glass-border/30">
                        <th className="text-left py-2 px-3 text-muted-foreground">Subject</th>
                        <th className="text-center py-2 px-3 text-muted-foreground">Marks</th>
                        <th className="text-center py-2 px-3 text-muted-foreground">Max</th>
                        <th className="text-center py-2 px-3 text-muted-foreground">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rec.subjects.map((sub, j) => (
                        <tr key={j} className="border-b border-glass-border/10">
                          <td className="py-2 px-3 text-foreground">{sub.name}</td>
                          <td className="py-2 px-3 text-center text-foreground">{sub.marks}</td>
                          <td className="py-2 px-3 text-center text-muted-foreground">{sub.maxMarks}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {((sub.marks / sub.maxMarks) * 100).toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ College Semesters (Changed to Grade) ═══ */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl font-bold text-foreground">College Semesters</h3>
          </div>
          <div className="space-y-6">
            {data.college.map((sem, si) => (
              <div key={si} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-lg font-bold text-foreground">{sem.name}</h4>
                  <div className="flex gap-3">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">SGPA: {sem.sgpa}</span>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">CGPA: {sem.cgpa}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glass-border/30">
                        <th className="text-left py-2 px-3 text-muted-foreground">Subject</th>
                        <th className="text-center py-2 px-3 text-muted-foreground">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sem.subjects.map((sub, sj) => (
                        <tr key={sj} className="border-b border-glass-border/10">
                          <td className="py-2 px-3 text-foreground">{sub.name}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`font-mono font-bold text-sm ${sub.grade === 'U' ? 'text-red-400' : 'text-primary'}`}>
                              {sub.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Edit Modal (College Part Modified) ═══ */}
      <AnimatePresence>
        {editMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setEditMode(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold gradient-text">Edit Marksheet</h3>
                <button onClick={() => setEditMode(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
              </div>

              {/* College Edit Section */}
              <h4 className="font-display text-sm font-bold text-primary mb-3">College Semesters (Grades)</h4>
              <div className="space-y-4">
                {editData.college.map((sem, si) => (
                  <div key={si} className="border border-glass-border/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input value={sem.name} onChange={(e) => { const d = JSON.parse(JSON.stringify(editData)); d.college[si].name = e.target.value; setEditData(d); }} className={`flex-1 ${inp}`} />
                      <button onClick={() => removeSemester(si)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    {sem.subjects.map((sub, sj) => (
                      <div key={sj} className="flex gap-2 mb-2 items-center">
                        <input value={sub.name} onChange={(e) => updateCollegeSubject(si, sj, "name", e.target.value)} placeholder="Subject" className={`flex-1 ${inp}`} />
                        <select 
                          value={sub.grade} 
                          onChange={(e) => updateCollegeSubject(si, sj, "grade", e.target.value)}
                          className={`w-24 ${inp}`}
                        >
                          {["O", "A+", "A", "B+", "B", "C", "U"].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        <button onClick={() => removeCollegeSubject(si, sj)} className="text-destructive/60"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={() => addCollegeSubject(si)} className="text-xs text-primary flex items-center gap-1 mt-2 underline"><Plus className="w-3 h-3" /> Add Subject</button>
                  </div>
                ))}
                <button onClick={addSemester} className="w-full py-2 text-xs font-mono text-primary border border-primary/30 rounded-lg">Add Semester</button>
              </div>

              <button onClick={handleSave} className="w-full mt-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MarksheetSection;
