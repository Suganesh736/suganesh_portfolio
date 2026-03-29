import { useState, useEffect } from "react";

/* ───────── TYPES ───────── */
interface SubjectMark {
  name: string;
  marks: number;
  maxMarks: number;
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
}

interface DataType {
  school: {
    label: string;
    subjects: SubjectMark[];
  }[];
  college: CollegeSemester[];
}

/* ───────── DEFAULT DATA ───────── */
const defaultData: DataType = {
  school: [
    {
      label: "10th",
      subjects: [
        { name: "Tamil", marks: 80, maxMarks: 100 },
        { name: "English", marks: 75, maxMarks: 100 },
      ],
    },
  ],
  college: [
    {
      name: "Semester 1",
      subjects: [
        { name: "Maths", grade: "O" },
        { name: "Physics", grade: "A+" },
      ],
      sgpa: 0,
      cgpa: 0,
    },
  ],
};

/* ───────── GRADE → POINT ───────── */
const gradeToPoint = (g: string) => {
  switch (g) {
    case "O": return 10;
    case "A+": return 9;
    case "A": return 8;
    case "B+": return 7;
    case "B": return 6;
    default: return 0;
  }
};

/* ───────── SGPA ───────── */
const calcSGPA = (subs: CollegeSubject[]) => {
  if (!subs.length) return 0;
  const total = subs.reduce((a, s) => a + gradeToPoint(s.grade), 0);
  return Number((total / subs.length).toFixed(2));
};

/* ───────── CGPA ───────── */
const calcCGPA = (sem: CollegeSemester[]) => {
  if (!sem.length) return 0;
  const total = sem.reduce((a, s) => a + s.sgpa, 0);
  return Number((total / sem.length).toFixed(2));
};

/* ───────── COMPONENT ───────── */
export default function Marksheet() {
  const [data, setData] = useState<DataType>(defaultData);

  /* 🔥 AUTO CALC */
  useEffect(() => {
    setData((prev) => {
      const updated = { ...prev };

      updated.college = updated.college.map((sem) => ({
        ...sem,
        sgpa: calcSGPA(sem.subjects),
      }));

      const cgpa = calcCGPA(updated.college);

      updated.college = updated.college.map((sem) => ({
        ...sem,
        cgpa: cgpa,
      }));

      return updated;
    });
  }, []);

  /* 🔐 PASSWORD EDIT */
  const editValue = (type: "sgpa" | "cgpa", i: number) => {
    const pass = prompt("Enter Password");

    if (pass === "4646") {
      const val = prompt("Enter value");

      if (!val) return;

      setData((prev) => {
        const d = { ...prev };
        if (type === "sgpa") d.college[i].sgpa = Number(val);
        else d.college[i].cgpa = Number(val);
        return d;
      });
    } else {
      alert("Wrong Password ❌");
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">

      <h1 className="text-3xl mb-6">🎓 Marksheet</h1>

      {/* SCHOOL */}
      <h2 className="text-xl mb-2">School</h2>
      {data.school.map((s, i) => (
        <div key={i} className="mb-4 border p-3 rounded">
          <h3>{s.label}</h3>
          {s.subjects.map((sub, j) => (
            <p key={j}>
              {sub.name} - {sub.marks}/{sub.maxMarks}
            </p>
          ))}
        </div>
      ))}

      {/* COLLEGE */}
      <h2 className="text-xl mt-6 mb-2">College</h2>

      {data.college.map((sem, i) => (
        <div key={i} className="mb-4 border p-3 rounded">

          <h3>{sem.name}</h3>

          {sem.subjects.map((sub, j) => (
            <p key={j}>
              {sub.name} - {sub.grade}
            </p>
          ))}

          <p
            className="cursor-pointer text-green-400"
            onClick={() => editValue("sgpa", i)}
          >
            SGPA: {sem.sgpa}
          </p>

          <p
            className="cursor-pointer text-blue-400"
            onClick={() => editValue("cgpa", i)}
          >
            CGPA: {sem.cgpa}
          </p>

        </div>
      ))}
    </div>
  );
}
