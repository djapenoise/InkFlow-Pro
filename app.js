const { useState } = React;

function App() {
    const [activeTab, setActiveTab] = useState('dash');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth()); 
    
    const months = [
        { name: "JANUAR", days: 31 }, { name: "FEBRUAR", days: 28 }, { name: "MART", days: 31 },
        { name: "APRIL", days: 30 }, { name: "MAJ", days: 31 }, { name: "JUN", days: 30 },
        { name: "JUL", days: 31 }, { name: "AVGUST", days: 31 }, { name: "SEPTEMBAR", days: 30 },
        { name: "OKTOBAR", days: 31 }, { name: "NOVEMBAR", days: 30 }, { name: "DECEMBAR", days: 31 }
    ];

    const [appointments, setAppointments] = useState([]);
    const [clients, setClients] = useState([]);
    const [newEntry, setNewEntry] = useState({ client: '', time: '', date: '', price: '', phone: '', social: '' });

    // --- LOGIKA ZA ANALITIKU ---
    const currentMonthName = months[currentMonthIdx].name;
    const monthlyAppointments = appointments.filter(a => a.date.includes(currentMonthName));
    const monthlyRevenue = monthlyAppointments.reduce((acc, curr) => acc + (parseInt(curr.price) || 0), 0);
    const monthlyClientsCount = monthlyAppointments.length;
    
    // Cilj zarade (npr. 2000€) za progres bar
    const monthlyGoal = 2000; 
    const progressPercent = Math.min((monthlyRevenue / monthlyGoal) * 100, 100);

    const handleMonthChange = (dir) => {
        if (dir === 'next') setCurrentMonthIdx(prev => (prev === 11 ? 0 : prev + 1));
        else setCurrentMonthIdx(prev => (prev === 0 ? 11 : prev - 1));
    };

    const handleSave = () => {
        if (!newEntry.client) return;
        if (!clients.find(c => c.name.toLowerCase() === newEntry.client.toLowerCase())) {
            setClients([...clients, { name: newEntry.client, phone: newEntry.phone, social: newEntry.social, id: Date.now() }]);
        }
        setAppointments([...appointments, { ...newEntry, id: Date.now() }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', time: '', date: '', price: '', phone: '', social: '' });
    };

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black gold-text italic tracking-tight uppercase">INKFLOW PRO</h1>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Business Intelligence</p>
                </div>
                {activeTab !== 'dash' && activeTab !== 'biz' && (
                    <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-6 py-2 rounded-full font-black text-xs uppercase">ADD</button>
                )}
            </header>

            <main className="p-4">
                {/* DASHBOARD (UPCOMING) */}
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="card-bg p-6 border-l-4 border-yellow-600">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 italic">Next Sessions</h3>
                            {appointments.length === 0 ? <p className="text-center opacity-20 py-10 italic text-sm">No upcoming appointments</p> : 
                                appointments.slice(0, 5).map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl mb-3 flex justify-between items-center">
                                        <div><p className="font-bold">{app.client}</p><p className="text-[10px] text-slate-500 uppercase">{app.date} | {app.time}</p></div>
                                        <p className="gold-text font-black">{app.price}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* BUSINESS OVERVIEW (NOVO!) */}
                {activeTab === 'biz' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center px-2">
                             <button onClick={() => handleMonthChange('prev')} className="text-yellow-500 text-2xl font-black px-4"> &lt; </button>
                             <h2 className="font-black gold-text italic uppercase tracking-widest">{currentMonthName} Stats</h2>
                             <button onClick={() => handleMonthChange('next')} className="text-yellow-500 text-2xl font-black px-4"> &gt; </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="card-bg p-8 text-center shadow-xl">
                                <p className="text-5xl font-black gold-text">{monthlyRevenue}€</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-[0.2em]">Total Revenue</p>
                                
                                <div className="mt-8 space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span>Progress to Goal</span>
                                        <span className="gold-text">{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-bg p-6 flex justify-between items-center">
                                <div>
                                    <p className="text-3xl font-black">{monthlyClientsCount}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Clients Served</p>
                                </div>
                                <div className="text-right text-slate-500 italic text-[10px]">
                                    Avg: {monthlyClientsCount > 0 ? (monthlyRevenue / monthlyClientsCount).toFixed(0) : 0}€ / session
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CALENDAR */}
                {activeTab === 'cal' && (
                    <div className="space-y-6">
                        <div className="card-bg p-6">
                            <div className="flex justify-between items-center mb-8 px-2 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800">
                                <button onClick={() => handleMonthChange('prev')} className="text-yellow-500 text-3xl font-black px-4"> &lt; </button>
                                <p className="font-black gold-text italic tracking-widest text-lg uppercase">{months[currentMonthIdx].name}</p>
                                <button onClick={() => handleMonthChange('next')} className="text-yellow-500 text-3xl font-black px-4"> &gt; </button>
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => (
                                    <button 
                                        key={day} 
                                        onClick={() => { setNewEntry({...newEntry, date: `${day}. ${months[currentMonthIdx].name}`}); setIsModalOpen(true); }}
                                        className="aspect-square flex items-center justify-center rounded-xl text-xs font-bold bg-[#0f172a] border border-slate-800 active:bg-yellow-500 active:text-black"
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CRM */}
                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        {clients.map(c => (
                            <div key={c.id} className="card-bg p-5 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center text-black font-bold uppercase">{c.name[0]}</div>
                                    <div><p className="font-bold">{c.name}</p><p className="text-[10px] text-slate-500 uppercase">{c.social || '@no_tag'}</p></div>
                                </div>
                                <a href={`tel:${c.phone}`} className="text-yellow-500 p-3 bg-[#0f172a] rounded-full font-bold text-xs uppercase">Call</a>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL (Isto kao pre) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end justify-center" onClick={() => setIsModalOpen(false)}>
                    <div className="card-bg w-full max-w-lg p-8 rounded-b-none border-t border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 tracking-tighter">New Appointment</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#0f172a] border border-slate-800 p-5 rounded-2xl outline-none font-bold placeholder:text-slate-700 text-white" onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="tel" placeholder="Phone" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl text-sm outline-none text-white" onChange={e => setNewEntry({...newEntry, phone: e.target.value})} />
                                <input type="text" placeholder="Instagram" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl text-sm outline-none text-white" onChange={e => setNewEntry({...newEntry, social: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="time" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl font-bold text-yellow-500 outline-none" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                <input type="number" placeholder="Price €" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl font-bold text-white outline-none" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                            </div>
                            <div className="pt-8 space-y-4 text-center">
                                <button onClick={handleSave} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest shadow-xl">Save</button>
                                <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 font-bold p-2 text-[10px] uppercase tracking-[0.2em]">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVIGACIJA SA DODATIM BIZ TABOM */}
            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-5 shadow-2xl z-50">
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
