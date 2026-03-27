import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Send, CheckCircle, Github, Linkedin, Instagram, Youtube, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";

const socials = [
  { icon: Github, label: "GitHub", href: "https://github.com/Suganesh736" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/suganesh07" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/mr__suganesh__" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@suganesh_46" },
];

// Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

const ContactSection = () => {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ref = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("sending");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
          to_email: "suganeshranganathan3@gmail.com",
        },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />

      <div className="max-w-4xl mx-auto relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-secondary font-mono text-sm tracking-widest uppercase mb-2">Get In Touch</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold gradient-text">Contact Me</h2>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8">
          <motion.form
            ref={formRef}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="md:col-span-3 glass-card p-6 sm:p-8 space-y-5"
          >
            <div>
              <label className="font-body text-sm text-muted-foreground mb-1.5 block">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="font-body text-sm text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="font-body text-sm text-muted-foreground mb-1.5 block">Message</label>
              <textarea
                rows={4}
                placeholder="Type your message here..."
                value={form.message}
                onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: "" }); }}
                className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all resize-none"
              />
              {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={status === "sending"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg flex items-center justify-center gap-2 neon-glow-purple transition-all disabled:opacity-70"
            >
              {status === "sending" && <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>}
              {status === "sent" && <><CheckCircle className="w-4 h-4" /> Message sent successfully!</>}
              {status === "error" && "Failed to send. Try again."}
              {status === "idle" && <><Send className="w-4 h-4" /> Send Message</>}
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="md:col-span-2 flex flex-col gap-4"
          >
            <div className="glass-card p-6">
              <h4 className="font-display text-sm font-semibold mb-4 gradient-text">Connect</h4>
              <div className="space-y-3">
                {socials.map(({ icon: Icon, label, href }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 group-hover:neon-glow-purple transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-body text-sm">{label}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-20 text-center glass-card p-10 neon-glow-purple"
        >
          <h3 className="font-display text-2xl sm:text-3xl font-bold gradient-text mb-3">
            Let's build something amazing together
          </h3>
          <p className="font-body text-muted-foreground text-sm max-w-lg mx-auto">
            I'm always open to collaborating on innovative embedded systems and IoT projects.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
