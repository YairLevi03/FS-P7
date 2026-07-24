import React, { createContext, useContext, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm'
    title: '',
    message: '',
  });

  const resolverRef = useRef(null);

  const showAlert = (title, message) => {
    setModal({
      isOpen: true,
      type: 'alert',
      title,
      message,
    });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  };

  const showConfirm = (title, message) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title,
      message,
    });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  };

  const handleClose = (value) => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modal.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with blur & click block */}
          <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[3px]" />
          
          {/* Dialog Card */}
          <div className="glass-card max-w-md w-full p-6 animate-slide-up relative z-10 !bg-[#1e293b]/95 border border-white/10 shadow-2xl flex flex-col gap-4">
            <div>
              <h3 className={`text-xl font-bold mb-2 ${modal.type === 'confirm' ? 'text-indigo-400' : 'text-amber-400'}`}>
                {modal.title || (modal.type === 'confirm' ? 'Confirmation Required' : 'Alert')}
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">{modal.message}</p>
            </div>
            
            <div className="flex gap-3 justify-end mt-2">
              {modal.type === 'confirm' && (
                <button 
                  onClick={() => handleClose(false)} 
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={() => handleClose(true)} 
                className="btn-primary px-4 py-2"
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
