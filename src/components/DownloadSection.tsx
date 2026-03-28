import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Download, FileText, FolderOpen, BookOpen, Upload, Eye } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { loadContent, saveContent, uploadFile } from "@/lib/portfolio-db";

interface DownloadItem {
  label: string;
  icon: typeof FileText;
  key: string;
}

const items: DownloadItem[] = [
  { label: "Resume", icon: FileText, key: "resume" },
  { label: "Projects Report", icon: FolderOpen, key: "projects" },
  { label: "Marksheet", icon: BookOpen, key: "marksheet" },
];

const DownloadSection = () => {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const { requestAuth } = useAdmin();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    loadContent<Record<string, string>>("downloads", {}).then(setFiles);
  }, []);

  const handleUpload = (key: string) => {
    requestAuth(() => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const url = await uploadFile(file, `downloads/${key}_${Date.now()}.pdf`);
        const updated = { ...files, [key]: url };
        setFiles(updated);
        await saveContent("downloads", updated);
      };
      input.click();
    });
  };

  const handleDownload = (key: string, label: string) => {
    const data = files[key];
    if (!data) return;
    const link = document.createElement("a");
    link.href = data;
    link.download = `${label.replace(/\s+/g, "_")}_Suganesh.pdf`;
    link.target = "_blank";
    link.click();
  };

  return (
    <section id="downloads" className="section-padding relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-secondary font-mono text-sm tracking-widest uppercase mb-2">Resources</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold gradient-text">Downloads</h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {items.map(({ label, icon: Icon, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="glass-card p-6 text-center group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-2">{label}</h3>
              <p className="font-body text-xs text-muted-foreground mb-4">
                {files[key] ? "File uploaded — ready to download" : "No file uploaded yet"}
              </p>

              <div className="flex flex-col gap-2">
                {files[key] && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDownload(key, label)}
                      className="w-full py-2.5 bg-primary text-primary-foreground font-body font-semibold text-sm rounded-lg flex items-center justify-center gap-2 neon-glow-purple transition-all"
                    >
                      <Download className="w-4 h-4" /> Download
                    </motion.button>
                    <button
                      onClick={() => setPreviewKey(key)}
                      className="w-full py-2 text-xs font-mono text-muted-foreground hover:text-primary border border-glass-border/30 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleUpload(key)}
                  className="w-full py-2 text-xs font-mono text-muted-foreground hover:text-primary border border-glass-border/30 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Upload className="w-3 h-3" /> {files[key] ? "Replace" : "Upload"} PDF
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewKey && files[previewKey] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
          onClick={() => setPreviewKey(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl h-[80vh] glass-card p-2 neon-glow-purple"
          >
            <iframe src={files[previewKey]} className="w-full h-full rounded-lg" title="PDF Preview" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default DownloadSection;
