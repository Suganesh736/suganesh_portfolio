import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const DEFAULT_PASSWORD = "4646";

interface AdminContextType {
  requestAuth: (onSuccess: () => void) => void;
  showPasswordDialog: boolean;
  setShowPasswordDialog: (v: boolean) => void;
  pendingAction: (() => void) | null;
  currentPassword: string;
  verifyPassword: (password: string) => boolean;
  showChangePassword: boolean;
  setShowChangePassword: (v: boolean) => void;
  changePassword: (oldPw: string, newPw: string) => boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be inside AdminProvider");
  return ctx;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [currentPassword, setCurrentPassword] = useState(() => {
    try {
      return localStorage.getItem("portfolio_admin_pw") || DEFAULT_PASSWORD;
    } catch { return DEFAULT_PASSWORD; }
  });

  // Every edit action always asks for password - no session
  const requestAuth = useCallback((onSuccess: () => void) => {
    setPendingAction(() => onSuccess);
    setShowPasswordDialog(true);
  }, []);

  const verifyPassword = useCallback((password: string) => {
    return password === currentPassword;
  }, [currentPassword]);

  const changePassword = useCallback((oldPw: string, newPw: string) => {
    if (oldPw === currentPassword) {
      setCurrentPassword(newPw);
      try { localStorage.setItem("portfolio_admin_pw", newPw); } catch {}
      return true;
    }
    return false;
  }, [currentPassword]);

  return (
    <AdminContext.Provider value={{
      requestAuth, showPasswordDialog, setShowPasswordDialog,
      pendingAction, currentPassword, verifyPassword,
      showChangePassword, setShowChangePassword, changePassword
    }}>
      {children}
    </AdminContext.Provider>
  );
};
