import React, { useEffect, useState } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { useAuthStore } from '@/store/authStore';
import { 
  Search, 
  Plus, 
  CreditCard, 
  DollarSign, 
  Loader2, 
  FileText, 
  PlusCircle, 
  Trash2
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice, InvoiceItem } from '@/types';

export const Billing: React.FC = () => {
  const { user } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Invoice Items State for Form
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Consultation Fee', quantity: 1, unitPrice: 85, total: 85 }
  ]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Failed to load invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, [fetchPatients]);

  // Form helpers
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = updated[index];
    
    if (field === 'description') {
      item.description = value;
    } else if (field === 'quantity') {
      item.quantity = Number(value);
      item.total = item.quantity * item.unitPrice;
    } else if (field === 'unitPrice') {
      item.unitPrice = Number(value);
      item.total = item.quantity * item.unitPrice;
    }

    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce((acc, curr) => acc + curr.total, 0);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !dueDate) {
      alert('Please fill out all required fields');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.name,
          date: new Date().toISOString().split('T')[0],
          dueDate: dueDate,
          amount: calculateTotal(),
          status: 'unpaid',
          items: items,
        }),
      });

      if (!res.ok) throw new Error('Failed to issue invoice');
      
      // Reset form
      setSelectedPatientId('');
      setDueDate('');
      setItems([{ description: 'Consultation Fee', quantity: 1, unitPrice: 85, total: 85 }]);
      setShowAddModal(false);

      // Refresh invoices
      fetchInvoices();
    } catch (err: any) {
      alert(err.message || 'Error occurred while creating invoice');
    }
  };

  // Filters & Search
  const filteredInvoices = invoices.filter((inv) => {
    // Patients can only see their own invoices
    const belongsToPatient = user?.role !== 'patient' || inv.patientId === user.id;

    const matchesSearch = 
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || inv.status === selectedStatus;

    return belongsToPatient && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Billing & Invoices</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Track transaction records, manage patient accounts, and issue service invoices</p>
        </div>
        {user?.role !== 'patient' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow shadow-blue-500/10 transition select-none"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </button>
        )}
      </div>

      {/* Statistics Header (Summary tiles) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="rounded-xl bg-blue-50 text-blue-600 p-3 dark:bg-blue-900/20 dark:text-blue-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Billed</p>
            <p className="text-base font-extrabold text-slate-850 dark:text-white mt-1">
              {formatCurrency(invoices.reduce((acc, curr) => acc + curr.amount, 0))}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="rounded-xl bg-emerald-50 text-emerald-600 p-3 dark:bg-emerald-900/20 dark:text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payments Collected</p>
            <p className="text-base font-extrabold text-slate-850 dark:text-white mt-1">
              {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0))}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center space-x-4">
          <div className="rounded-xl bg-orange-50 text-orange-655 p-3 dark:bg-orange-950/20 dark:text-orange-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Outstanding Balances</p>
            <p className="text-base font-extrabold text-slate-850 dark:text-white mt-1">
              {formatCurrency(invoices.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + curr.amount, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors flex flex-col sm:flex-row items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900 transition"
            placeholder="Search by patient name or invoice ID..."
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full sm:w-44 capitalize"
        >
          <option value="all">All Invoices</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
        </select>

      </div>

      {/* Invoice Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Loading ledger files...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-400 mb-4 border border-slate-200 dark:border-slate-800">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">No invoices found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search criteria or filter status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500 select-none">
                  <th className="py-3.5 px-6">Invoice ID</th>
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">Bill Date</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Billed Amount</th>
                  <th className="py-3.5 px-6">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                    
                    {/* Invoice ID */}
                    <td className="py-4 px-6 font-bold font-mono text-slate-850 dark:text-white uppercase">
                      {inv.id}
                    </td>

                    {/* Patient */}
                    <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-350">
                      {inv.patientName}
                    </td>

                    {/* Bill Date */}
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                      {formatDate(inv.date)}
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                      {formatDate(inv.dueDate)}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 font-bold text-slate-850 dark:text-white">
                      {formatCurrency(inv.amount)}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-600 dark:bg-emerald-900/15 dark:border-emerald-900/30 dark:text-emerald-400'
                          : inv.status === 'unpaid'
                          ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/15 dark:border-orange-900/30 dark:text-orange-400'
                          : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/15 dark:border-red-900/30 dark:text-red-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 transition-all animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center">
                <FileText className="mr-1.5 h-4 w-4 text-blue-600" />
                <span>Issue Accounts Invoice</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              
              {/* Select Patient */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Select Patient *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ID: {p.id.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-350 mb-1">Payment Due Date *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                  required
                />
              </div>

              {/* Dynamic Invoice Items */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Billable Services & Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      
                      {/* Description */}
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white"
                        placeholder="Service name / item..."
                        required
                      />

                      {/* Quantity */}
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-14 rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white text-center"
                        required
                      />

                      {/* Unit Price */}
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-20 rounded-lg border border-slate-200 bg-slate-50 p-2 focus:bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-white text-center"
                        placeholder="$"
                        required
                      />

                      {/* Total */}
                      <span className="w-16 text-right font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {formatCurrency(item.total)}
                      </span>

                      {/* Trash */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="text-red-500 hover:text-red-750 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm">
                <span>Invoice Total:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-base">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-750 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
                >
                  Issue Invoice
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Billing;
