import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Send, CheckCircle, Github, Linkedin, Instagram, Youtube } from "lucide-react";

const socials = [
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

const ContactSection = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", message: "" });
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
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="md:col-span-3 glass-card p-6 sm:p-8 space-y-5"
          >
            {[
              { key: "name", label: "Name", type: "text" },
              { key: "email", label: "Email", type: "email" },
            ].map((f) => (
              <div key={f.key}>
                <label className="font-body text-sm text-muted-foreground mb-1.5 block">{f.label}</label>
                <input
                  type={f.type}
                  required
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
            ))}
            <div>
              <label className="font-body text-sm text-muted-foreground mb-1.5 block">Message</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg flex items-center justify-center gap-2 neon-glow-purple transition-all"
            >
              {sent ? <><CheckCircle className="w-4 h-4" /> Sent!</> : <><Send className="w-4 h-4" /> Send Message</>}
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

            <div className="glass-card p-6 flex-1">
              <h4 className="font-display text-sm font-semibold mb-2 gradient-text">Email</h4>
              <p className="font-body text-xs text-muted-foreground break-all">suganeshranganathan3@gmail.com</p>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
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
