import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { BookOpen, Pencil, Plus, Trash2, X, Download, GraduationCap, School, Save } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { loadContent, saveContent } from "@/lib/portfolio-db";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ───────── Grade System ───────── */
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

/* ───────── Default Data ───────── */
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
        { name: "Maths", grade: "A+" },
        { name: "Physics", grade: "B+" },
      ],
      sgpa: 0,
      cgpa: 0,
      manualCgpa: false
    }
  ],
};

/* ───────── Component ───────── */
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

  /* ───── PDF ───── */
  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    data.college.forEach((sem) => {
      autoTable(doc, {
        head: [["Subject", "Grade"]],
        body: sem.subjects.map((s) => [s.name, s.grade]),
        foot: [[`SGPA: ${calcSGPA(sem.subjects)}`, `CGPA: ${calcCGPA(data.college)}`]],
      });
    });

    doc.save("Marksheet.pdf");
  };

  return (
    <section>
      <h2>Education & Marksheet</h2>

      {/* SCHOOL */}
      {data.school.map((rec, i) => (
        <div key={i}>
          <h3>{rec.label}</h3>
          {rec.subjects.map((s, j) => (
            <p key={j}>{s.name} - {s.marks}</p>
          ))}
        </div>
      ))}

      {/* COLLEGE */}
      {data.college.map((sem, i) => (
        <div key={i}>
          <h3>{sem.name}</h3>

          <p>SGPA: {calcSGPA(sem.subjects)}</p>
          <p>CGPA: {sem.manualCgpa ? sem.cgpa : calcCGPA(data.college)}</p>

          {sem.subjects.map((s, j) => (
            <p key={j}>{s.name} - {s.grade}</p>
          ))}
        </div>
      ))}

      <button onClick={() => setEditMode(true)}>Edit</button>
      <button onClick={handleDownloadPdf}>Download PDF</button>

      {editMode && (
        <div>
          {editData.college.map((sem, si) => (
            <div key={si}>
              <input value={sem.name} />

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
              />

              {sem.subjects.map((s, sj) => (
                <div key={sj}>
                  <input value={s.name} />
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

          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </section>
  );
};

export default MarksheetSection;
