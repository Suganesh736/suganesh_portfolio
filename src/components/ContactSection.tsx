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

const ContactSection = () => {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const ref = useRef(null);
  const formRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("sending");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus("sent");
      setForm({ name: "", email: "", message: "" });

      setTimeout(() => setStatus("idle"), 4000);
    } catch (error) {
      console.error(error);
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

            <input
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg"
            />

            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg"
            />

            <textarea
              placeholder="Type your message..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg"
            />

            <button type="submit" disabled={status === "sending"}>
              {status === "sending" && "Sending..."}
              {status === "sent" && "Message Sent ✅"}
              {status === "error" && "Failed ❌"}
              {status === "idle" && "Send Message"}
            </button>

          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
