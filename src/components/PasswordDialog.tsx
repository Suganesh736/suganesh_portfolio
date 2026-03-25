import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const PasswordDialog = () => {
  const {
    showPasswordDialog, setShowPasswordDialog,
    showChangePassword, setShowChangePassword,
    login, pendingAction, changePassword, isAuthenticated, logout
  } = useAdmin();

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError("");
      setPassword("");
      setShowPasswordDialog(false);
      pendingAction?.();
    } else {
      setError("Incorrect password");
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 4) {
      setChangeError("New password must be at least 4 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setChangeError("Passwords don't match");
      return;
    }
    if (changePassword(oldPw, newPw)) {
      setChangeError("");
      setChangeSuccess(true);
      setTimeout(() => {
        setChangeSuccess(false);
        setShowChangePassword(false);
        setOldPw(""); setNewPw(""); setConfirmPw("");
      }, 2000);
    } else {
      setChangeError("Current password is incorrect");
    }
  };

  const closeLogin = () => {
    setShowPasswordDialog(false);
    setPassword("");
    setError("");
  };

  const closeChange = () => {
    setShowChangePassword(false);
    setOldPw(""); setNewPw(""); setConfirmPw("");
    setChangeError(""); setChangeSuccess(false);
  };

  return (
    <>
      {/* Login Dialog */}
      <AnimatePresence>
        {showPasswordDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={closeLogin}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card neon-glow-purple p-6 sm:p-8 max-w-sm w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-lg font-bold gradient-text">Admin Login</h3>
                </div>
                <button onClick={closeLogin} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 pr-10 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <p className="text-destructive text-xs font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                  </p>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg flex items-center justify-center gap-2 neon-glow-purple transition-all"
                >
                  <KeyRound className="w-4 h-4" /> Unlock
                </motion.button>

                <button
                  type="button"
                  onClick={() => { closeLogin(); setShowChangePassword(true); }}
                  className="w-full text-xs text-muted-foreground hover:text-primary font-mono transition-colors"
                >
                  Change Password
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Dialog */}
      <AnimatePresence>
        {showChangePassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={closeChange}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card neon-glow-purple p-6 sm:p-8 max-w-sm w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold gradient-text">Change Password</h3>
                <button onClick={closeChange} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {changeSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="font-body text-sm text-foreground">Password changed successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <input
                    type="password"
                    value={oldPw}
                    onChange={(e) => { setOldPw(e.target.value); setChangeError(""); }}
                    placeholder="Current password"
                    className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => { setNewPw(e.target.value); setChangeError(""); }}
                    placeholder="New password"
                    className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => { setConfirmPw(e.target.value); setChangeError(""); }}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-muted/30 border border-glass-border/30 rounded-lg text-foreground font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  {changeError && (
                    <p className="text-destructive text-xs font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {changeError}
                    </p>
                  )}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-primary text-primary-foreground font-body font-semibold rounded-lg neon-glow-purple transition-all"
                  >
                    Update Password
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PasswordDialog;
