import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { BookOpen, Pencil, Plus, Trash2, X, Download, GraduationCap, School, Save } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { loadContent, saveContent } from "@/lib/portfolio-db";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ✅ Grade System */
const gradePoints: any = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "U": 0
};

const calcSGPA = (subjects: any[]) => {
  let total = 0;
  subjects.forEach((s) => total += gradePoints[s.grade] || 0);
  return subjects.length ? Number((total / subjects.length).toFixed(2)) : 0;
};

const calcCGPA = (college: any[]) => {
  let total = 0;
  college.forEach((sem) => total += calcSGPA(sem.subjects));
  return college.length ? Number((total / college.length).toFixed(2)) : 0;
};

/* Types */
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

/* ✅ CHANGED */
interface CollegeSubject {
  name: string;
  grade: string;
}

interface CollegeSemester {
  name: string;
  subjects: CollegeSubject[];
  sgpa: number;
  cgpa: number;
  manualCgpa?: boolean;
}

interface MarksheetData {
  school: SchoolRecord[];
  college: CollegeSemester[];
}

/* Default */
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
      ],
    },
  ],
  college: [
    {
      name: "Semester 1",
      subjects: [
        { name: "Mathematics I", grade: "A+" },
        { name: "Physics", grade: "B+" },
      ],
      sgpa: 0,
      cgpa: 0,
      manualCgpa: false
    }
  ],
};

const MarksheetSection = () => {
  const [data, setData] = useState(defaultData);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(defaultData);
  const { requestAuth } = useAdmin();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    loadContent("marksheet_v3", defaultData).then(setData);
  }, []);

  const handleSave = async () => {
    setData(editData);
    setEditMode(false);
    await saveContent("marksheet_v3", editData);
  };

  /* PDF */
  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    data.college.forEach((sem) => {
      autoTable(doc, {
        head: [["Subject", "Grade"]],
        body: sem.subjects.map((s) => [s.name, s.grade]),
        foot: [[
          `SGPA: ${calcSGPA(sem.subjects)}`,
          `CGPA: ${calcCGPA(data.college)}`
        ]],
      });
    });

    doc.save("Marksheet.pdf");
  };

  return (
    <section className="section-padding">
      <h2 className="text-3xl font-bold text-center mb-6">Education & Marksheet</h2>

      {/* SCHOOL */}
      {data.school.map((rec, i) => (
        <div key={i} className="glass-card p-4 mb-4">
          <h3 className="font-bold text-primary">{rec.label}</h3>
          {rec.subjects.map((s, j) => (
            <p key={j}>{s.name} - {s.marks}</p>
          ))}
        </div>
      ))}

      {/* COLLEGE */}
      {data.college.map((sem, i) => (
        <div key={i} className="glass-card p-4 mb-4">
          <h3 className="font-bold">{sem.name}</h3>

          <p>SGPA: {calcSGPA(sem.subjects)}</p>
          <p>CGPA: {sem.manualCgpa ? sem.cgpa : calcCGPA(data.college)}</p>

          {sem.subjects.map((s, j) => (
            <p key={j}>{s.name} - {s.grade}</p>
          ))}
        </div>
      ))}

      <div className="flex gap-3 justify-center mt-4">
        <button onClick={() => setEditMode(true)} className="btn">Edit</button>
        <button onClick={handleDownloadPdf} className="btn">Download PDF</button>
      </div>

      {/* EDIT */}
      <AnimatePresence>
        {editMode && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">

              {editData.college.map((sem, si) => (
                <div key={si} className="mb-4">

                  <input value={sem.name} className="w-full mb-2" />

                  <label>
                    <input
                      type="checkbox"
                      checked={sem.manualCgpa}
                      onChange={(e) => {
                        const d = JSON.parse(JSON.stringify(editData));
                        d.college[si].manualCgpa = e.target.checked;
                        setEditData(d);
                      }}
                    />
                    Manual CGPA
                  </label>

                  <input
                    type="number"
                    value={sem.cgpa}
                    disabled={!sem.manualCgpa}
                    onChange={(e) => {
                      const d = JSON.parse(JSON.stringify(editData));
                      d.college[si].cgpa = Number(e.target.value);
                      setEditData(d);
                    }}
                    className="w-full mb-2"
                  />

                  {sem.subjects.map((s, sj) => (
                    <div key={sj} className="flex gap-2 mb-2">
                      <input value={s.name} className="flex-1" />
                      <select
                        value={s.grade}
                        onChange={(e) => {
                          const d = JSON.parse(JSON.stringify(editData));
                          d.college[si].subjects[sj].grade = e.target.value;
                          setEditData(d);
                        }}
                      >
                        <option>O</option>
                        <option>A+</option>
                        <option>A</option>
                        <option>B+</option>
                        <option>B</option>
                        <option>C</option>
                        <option>U</option>
                      </select>
                    </div>
                  ))}
                </div>
              ))}

              <button onClick={handleSave} className="w-full bg-blue-500 text-white p-2 rounded">
                Save
              </button>

            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MarksheetSection;
