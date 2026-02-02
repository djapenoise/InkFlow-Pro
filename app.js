const { useState, useEffect } = React;

function App() {
    const [activeTab, setActiveTab] = useState('dash');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const [appointments, setAppointments] = useState(() => {
        const saved = localStorage.getItem('inkflow_appointments');
        return saved ? JSON.parse(saved) : [];
    });

    const [clients, setClients] = useState(() => {
        const saved = localStorage.getItem('inkflow_clients');
        return saved ? JSON.parse(saved) : [];
    });

    const [newEntry, setNewEntry] = useState({ client: '', time: '', date: '', price: '', phone: '', social: '' });

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

    const currentMonthName = months[currentMonthIdx].name;
    const todayStr = `${new Date().getDate()}. ${months[new Date().getMonth()].name}`;

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

    const deleteApp = (id) => {
        if (window.confirm("Obrisati termin?")) setAppointments(appointments.filter(a => a.id !== id));
    };

    const deleteClient = (id) => {
        if (window.confirm("Obrisati klijenta iz baze?")) setClients(clients.filter(c => c.id !== id));
    };

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black gold-text italic uppercase">INKFLOW PRO</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tattoo Management</p>
                </div>
            </header>

            <main className="p-4">
                {/* 1. DASHBOARD - Aktuelni mesec i današnji plan */}
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black gold-text">
                                    {appointments.filter(a => a.date.includes(currentMonthName)).reduce((a, b) => a + (parseInt(b.price) || 0), 0)}€
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Revenue ({currentMonthName})</p>
                            </div>
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black">{appointments.filter(a => a.date === todayStr).length}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Today's Jobs</p>
                            </div>
                        </div>
                        <div className="card-bg p-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 italic text-center">Today's Schedule</h3>
                            {appointments.filter(a => a.date === todayStr).length === 0 ? <p className="text-center opacity-20 py-10 italic">No jobs today</p> :
                                appointments.filter(a => a.date === todayStr).map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl mb-3 flex justify-between items-center border-l-4 border-yellow-500">
                                        <div><p className="font-bold">{app.client}</p><p className="text-[10px] text-slate-500 uppercase">{app.time}</p></div>
                                        <p className="gold-text font-black">{app.price}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* 2. CALENDAR - Sa strelicama i Timeline-om */}
                {activeTab === 'cal' && (
                    <div className="space-y-6">
                        <div className="card-bg p-6">
                            <div className="flex justify-between items-center mb-6 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800">
                                <button onClick={() => handleMonthChange('prev')} className="text-yellow-500 text-2xl font-black px-4"> &lt; </button>
                                <div className="text-center">
                                    <p className="font-black gold-text italic text-lg uppercase">{currentMonthName}</p>
                                    <p className="text-[10px] text-slate-600 font-bold">2026</p>
                                </div>
                                <button onClick={() => handleMonthChange('next')} className="text-yellow-500 text-2xl font-black px-4"> &gt; </button>
                            </div>

                            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-4">
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => (
                                    <button 
                                        key={day}
                                        onClick={() => setSelectedDate(day)}
                                        className={`flex-shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500 border border-slate-800'}`}
                                    >
                                        <span className="text-[16px]">{day}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card-bg p-6 min-h-[300px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-black gold-text uppercase italic">{selectedDate}. {currentMonthName}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1 rounded-full font-black text-[10px] uppercase">Add Session</button>
                            </div>
                            <div className="space-y-3">
                                {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName}`).length === 0 ? 
                                    <p className="text-center opacity-20 py-10 italic">No appointments for this day</p> :
                                    appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName}`)
                                    .sort((a,b) => a.time.localeCompare(b.time))
                                    .map(app => (
                                        <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center border border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-slate-500 border-r border-slate-800 pr-3">{app.time}</span>
                                                <p className="font-bold text-white text-sm">{app.client}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="gold-text font-black text-xs">{app.price}</span>
                                                <button onClick={() => deleteApp(app.id)} className="text-red-900/50 text-xl px-1">×</button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. BUSINESS */}
                {activeTab === 'biz' && (
                    typeof BusinessOverview !== 'undefined' ? 
                    <BusinessOverview appointments={appointments} currentMonthName={currentMonthName} /> :
                    <div className="text-center p-10 gold-text uppercase font-black">Loading...</div>
                )}

                {/* 4. CLIENTS */}
                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        {clients.map(c => (
                            <div key={c.id} className="card-bg p-5 flex justify-between items-center border border-slate-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center text-black font-black">{c.name[0]}</div>
                                    <div>
                                        <p className="font-bold text-white">{c.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{c.social || '@no_tag'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={`tel:${c.phone}`} className="text-yellow-500 p-2 bg-[#0f172a] rounded-full font-black text-[10px] px-4 border border-slate-800">TEL</a>
                                    <button onClick={() => deleteClient(c.id)} className="text-red-900/30 p-2 text-xl">×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end" onClick={() => setIsModalOpen(false)}>
                    <div className="card-bg w-full p-8 rounded-t-[40px] border-t border-slate-800" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-6 text-center">{selectedDate}. {currentMonthName}</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#0f172a] border border-slate-800 p-5 rounded-2xl outline-none font-bold text-white text-center" 
                                onChange={e => setNewEntry({...newEntry, client: e.target.value, date: `${selectedDate}. ${currentMonthName}`})} />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="time" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl font-bold text-yellow-500" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                <input type="number" placeholder="Price €" className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl font-bold text-white" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                            </div>
                            <button onClick={handleSave} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4">Save Session</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVIGACIJA - Vraćeni puni nazivi */}
            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-4 shadow-2xl z-50 rounded-3xl">
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
