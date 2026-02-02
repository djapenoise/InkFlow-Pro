const { useState, useEffect } = React;

function App() {
    const [activeTab, setActiveTab] = useState('dash');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());

    // Učitavanje iz memorije
    const [appointments, setAppointments] = useState(() => {
        const saved = localStorage.getItem('inkflow_appointments');
        return saved ? JSON.parse(saved) : [];
    });

    const [clients, setClients] = useState(() => {
        const saved = localStorage.getItem('inkflow_clients');
        return saved ? JSON.parse(saved) : [];
    });

    const [newEntry, setNewEntry] = useState({ client: '', time: '', date: '', price: '', phone: '', social: '' });

    // Snimanje u memoriju
    useEffect(() => {
        localStorage.setItem('inkflow_appointments', JSON.stringify(appointments));
    }, [appointments]);

    useEffect(() => {
        localStorage.setItem('inkflow_clients', JSON.stringify(clients));
    }, [clients]);

    const months = [
        { name: "JANUAR", days: 31 }, { name: "FEBRUAR", days: 28 }, { name: "MART", days: 31 },
        { name: "APRIL", days: 30 }, { name: "MAJ", days: 31 }, { name: "JUN", days: 30 },
        { name: "JUL", days: 31 }, { name: "AVGUST", days: 31 }, { name: "SEPTEMBAR", days: 30 },
        { name: "OKTOBAR", days: 31 }, { name: "NOVEMBAR", days: 30 }, { name: "DECEMBAR", days: 31 }
    ];

    const handleMonthChange = (dir) => {
        if (dir === 'next') setCurrentMonthIdx(prev => (prev === 11 ? 0 : prev + 1));
        else setCurrentMonthIdx(prev => (prev === 0 ? 11 : prev - 1));
    };

    const handleSave = () => {
        if (!newEntry.client) return;
        const appId = Date.now();
        
        if (!clients.find(c => c.name.toLowerCase() === newEntry.client.toLowerCase())) {
            setClients([...clients, { name: newEntry.client, phone: newEntry.phone, social: newEntry.social, id: appId }]);
        }
        
        setAppointments([...appointments, { ...newEntry, id: appId + 1 }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', time: '', date: '', price: '', phone: '', social: '' });
    };

    const handleDelete = (id) => {
        if (window.confirm("Obrisati ovaj termin?")) {
            setAppointments(appointments.filter(app => app.id !== id));
        }
    };

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black gold-text italic tracking-tight uppercase">INKFLOW PRO</h1>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Tattoo Management</p>
                </div>
                {activeTab !== 'dash' && activeTab !== 'biz' && (
                    <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-6 py-2 rounded-full font-black text-xs uppercase">ADD</button>
                )}
            </header>

            <main className="p-4">
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-bg p-6 shadow-lg">
                                <p className="text-2xl font-black gold-text">{appointments.reduce((a, b) => a + (parseInt(b.price) || 0), 0)}€</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Total Revenue</p>
                            </div>
                            <div className="card-bg p-6 shadow-lg">
                                <p className="text-2xl font-black">{clients.length}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Total Clients</p>
                            </div>
                        </div>
                        <div className="card-bg p-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 italic text-center">Upcoming Sessions</h3>
                            {appointments.length === 0 ? <p className="text-center opacity-20 py-10 italic">No sessions yet</p> : 
                                appointments.map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl mb-3 flex justify-between items-center border-l-4 border-yellow-500 relative">
                                        <div>
                                            <p className="font-bold text-white">{app.client}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{app.date} | {app.time}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="gold-text font-black">{app.price}</p>
                                            <button onClick={() => handleDelete(app.id)} className="text-red-800 font-black text-xl px-2">×</button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {activeTab === 'cal' && (
                    <div className="card-bg p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-8 px-2 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800">
                            <button onClick={() => handleMonthChange('prev')} className="text-yellow-500 text-3xl font-black px-4"> &lt; </button>
                            <div className="text-center">
                                <p className="font-black gold-text italic tracking-widest text-lg uppercase">{months[currentMonthIdx].name}</p>
                                <p className="text-[10px] text-slate-600 font-bold">2026</p>
                            </div>
                            <button onClick={() => handleMonthChange('next')} className="text-yellow-500 text-3xl font-black px-4"> &gt; </button>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => (
                                <button 
                                    key={day} 
                                    onClick={() => { setNewEntry({...newEntry, date: `${day}. ${months[currentMonthIdx].name}`}); setIsModalOpen(true); }}
                                    className="aspect-square flex items-center justify-center rounded-xl text-xs font-bold bg-[#0f172a] border border-slate-800 active:bg-yellow-500 active:text-black transition-colors"
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'biz' && (
                    typeof BusinessOverview !== 'undefined' ? 
                    <BusinessOverview appointments={appointments} currentMonthName={months[currentMonthIdx].name} /> :
                    <div className="card-bg p-10 text-center gold-text font-black uppercase tracking-widest">Loading Business Stats...</div>
                )}

                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        {clients.length === 0 ? <p className="text-center opacity-20 py-10 italic">No clients yet</p> : 
                            clients.map(c => (
                                <div key={c.id} className="card-bg p-5 flex justify-between items-center shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 gold-bg rounded-full flex items-center justify-center text-black font-black text-lg">
                                            {c.name ? c.name[0].toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg leading-tight">{c.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{c.social || '@no_tag'}</p>
                                        </div>
                                    </div>
                                    <a href={`tel:${c.phone}`} className="text-yellow-500 p-3 bg-[#0f172a] rounded-full font-black text-[10px] px-5 shadow-inner">TEL</a>
                                </div>
                            ))
                        }
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end justify-center" onClick={() => setIsModalOpen(false)}>
                    <div className="card-bg w-full max-w-lg p-8 rounded-b-none border-t border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 tracking-tighter">New Appointment</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#0f172a] border border-slate-800 p-5 rounded-2xl outline-none font-bold text-white" onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="tel" placeholder="Phone" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl text-sm text-white" onChange={e => setNewEntry({...newEntry, phone: e.target.value})} />
                                <input type="text" placeholder="Instagram" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl text-sm text-white" onChange={e => setNewEntry({...newEntry, social: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="time" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl font-bold text-yellow-500" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                <input type="number" placeholder="Price €" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl font-bold text-white" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                            </div>
                            <button onClick={handleSave} className="w-full mt-4 gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-xl">Save</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 font-bold p-2 text-[10px] uppercase tracking-[0.2em]">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-4 shadow-2xl z-50">
                <button onClick={() => setActiveTab('dash')} className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'dash' ? 'gold-text' : 'text-slate-600'}`}>Home</button>
                <button onClick={() => setActiveTab('cal')} className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'cal' ? 'gold-text' : 'text-slate-600'}`}>Calendar</button>
                <button onClick={() => setActiveTab('biz')} className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'biz' ? 'gold-text' : 'text-slate-600'}`}>Business</button>
                <button onClick={() => setActiveTab('crm')} className={`text-[9px] font-black uppercase tracking-widest ${activeTab === 'crm' ? 'gold-text' : 'text-slate-600'}`}>Clients</button>
            </nav>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
