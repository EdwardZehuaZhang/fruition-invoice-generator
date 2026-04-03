import { useState, useEffect } from 'react';

const STORAGE_KEY = 'fruition_invoices';

export const useInvoiceStorage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    try {
      setLoading(true);
      const raw = localStorage.getItem(STORAGE_KEY);
      setInvoices(raw ? JSON.parse(raw) : []);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const saveInvoice = (invoice) => {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newInvoice = {
        ...invoice,
        id: Date.now().toString(),
        savedAt: new Date().toISOString()
      };
      const updated = [...current, newInvoice];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setInvoices(updated);
      return newInvoice;
    } catch (error) {
      console.error('Failed to save invoice:', error);
      throw error;
    }
  };

  const deleteInvoice = (id) => {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updated = current.filter(inv => inv.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setInvoices(updated);
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      throw error;
    }
  };

  const getNextInvoiceNumber = () => {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (current.length === 0) return '001';
    const numbers = current
      .map(inv => parseInt(inv.invoiceNo.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const maxNum = Math.max(0, ...numbers);
    return String(maxNum + 1).padStart(3, '0');
  };

  return { invoices, loading, saveInvoice, deleteInvoice, getNextInvoiceNumber };
};
