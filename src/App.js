import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { FaMoneyBillWave, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date());
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchTransactions();
    calculateBalance();
    // eslint-disable-next-line
  }, [transactions]);

  const fetchTransactions = async () => {
    const response = await axios.get('/api/transactions');
    setTransactions(response.data);
  };

  const calculateBalance = () => {
    let total = 0;
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        total += transaction.amount;
      } else {
        total -= transaction.amount;
      }
    });
    setBalance(total);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/transactions', {
      description,
      amount: Number(amount),
      type,
      date
    });
    setDescription('');
    setAmount('');
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/transactions/${id}`);
    fetchTransactions();
  };

  const data = {
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [
      {
        data: [
          transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
        ],
        backgroundColor: ['#4CAF50', '#F44336'],
        hoverBackgroundColor: ['#66BB6A', '#EF5350']
      }
    ]
  };

  return (
    <div className="main-bg">
      <div className="container mt-5">
        <h1 className="text-center mb-4 title-gradient">
          <FaMoneyBillWave style={{marginRight:8}} /> Money Tracker
        </h1>
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4 saldo-card">
              <div className="card-body">
                <h5 className="card-title">Saldo Saat Ini</h5>
                <h2 className={balance >= 0 ? 'text-success' : 'text-danger'}>
                  Rp{balance.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title"><FaPlusCircle style={{marginRight:6, color:'#06b6d4'}}/>Tambah Transaksi</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Deskripsi</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Jumlah</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipe</label>
                    <select 
                      className="form-select" 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="income">Pemasukan</option>
                      <option value="expense">Pengeluaran</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tanggal</label>
                    <DatePicker 
                      selected={date} 
                      onChange={(date) => setDate(date)} 
                      className="form-control"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Simpan</button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Statistik</h5>
                <div style={{ height: '300px' }}>
                  <Pie data={data} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Riwayat Transaksi</h5>
            <table className="table">
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
                {transactions.map(transaction => (
                  <tr key={transaction._id} className={transaction.type === 'income' ? 'table-success' : 'table-danger'}>
                    <td>{transaction.description}</td>
                    <td className={transaction.type === 'income' ? 'text-success' : 'text-danger'}>
                      {transaction.type === 'income' ? '+' : '-'}Rp{transaction.amount.toLocaleString()}
                    </td>
                    <td>{transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(transaction._id)}
                        className="btn btn-sm btn-danger"
                        title="Hapus"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;