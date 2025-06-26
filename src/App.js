import { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query, 
  orderBy 
} from 'firebase/firestore';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

Chart.register(ArcElement, Tooltip, Legend);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date());

  // ==================== CREATE ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "transactions"), {
        description,
        amount: Number(amount),
        type,
        date: date ? date : serverTimestamp()
      });
      setDescription('');
      setAmount('');
      setType('expense');
      setDate(new Date());
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  };

  // ==================== READ ====================
  const fetchTransactions = async () => {
    try {
      const q = query(
        collection(db, "transactions"), 
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const transactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date()
      }));
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
    }
  };

  // ==================== DELETE ====================
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction: ", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Hitung saldo
  const saldo = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

  // Data chart
  const pemasukan = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const pengeluaran = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const chartData = {
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [
      {
        data: [pemasukan, pengeluaran],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="main-bg" style={{ minHeight: '100vh', padding: '32px' }}>
      <h1 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2.5rem', marginBottom: 32 }}>
        <span role="img" aria-label="money">💵</span> Money Tracker
      </h1>
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 350, maxWidth: 400 }}>
          <div className="saldo-card card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 20 }}>Saldo Saat Ini</div>
            <div className="saldo-angka" style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>
              Rp{saldo.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>
              <span style={{ color: '#2563eb', marginRight: 8 }}>＋</span>Tambah Transaksi
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-label">Deskripsi</div>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi"
                required
                style={{ width: '100%', marginBottom: 12 }}
              />
              <div className="form-label">Jumlah</div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Jumlah"
                required
                style={{ width: '100%', marginBottom: 12 }}
              />
              <div className="form-label">Tipe</div>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', marginBottom: 12 }}>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
              <div className="form-label">Tanggal</div>
              <DatePicker
                selected={date}
                onChange={date => setDate(date)}
                dateFormat="dd/MM/yyyy"
                className="custom-date-input"
                style={{ width: '100%', marginBottom: 12 }}
              />
              <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 16 }}>Simpan</button>
            </form>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 350, maxWidth: 500 }}>
          <div className="card card-statistik" style={{ padding: 24 }}>
            <div className="card-title statistik-title">Statistik</div>
            <Pie data={chartData} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
              <div style={{ color: '#22c55e', fontWeight: 600 }}>Pemasukan</div>
              <div style={{ color: '#ef4444', fontWeight: 600 }}>Pengeluaran</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ margin: '32px auto', maxWidth: 900, padding: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>Daftar Transaksi</div>
        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Deskripsi</th>
              <th>Jumlah</th>
              <th>Tipe</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className={transaction.type === 'income' ? 'table-success' : 'table-danger'}>
                <td>{transaction.description}</td>
                <td>Rp{transaction.amount.toLocaleString('id-ID')}</td>
                <td className={transaction.type === 'income' ? 'text-success' : 'text-danger'}>
                  {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </td>
                <td>{transaction.date ? new Date(transaction.date).toLocaleDateString('id-ID') : '-'}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(transaction.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;