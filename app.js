const { useState, useEffect } = React;

function App() {
    const [activeTab, setActiveTab] = useState('dash');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [selectedClientData, setSelectedClientData] = useState(null);
    
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const [appointments, setAppointments] = useState(() => {
        const saved = localStorage.getItem('inkflow_appointments');
        return saved ? JSON.parse(saved) : [];
    });

    const [clients, setClients] = useState(() => {
        const saved = localStorage.getItem('inkflow_clients');
        return saved ? JSON.parse(saved) : [];
    });

    const [newEntry, setNewEntry] = useState({ 
        client: '', time: '', date: '', price: '', 
        phone: '', social: '', email: '', style: '' 
    });

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
    const todayStr = `${new Date().getDate()}. ${months[new Date().getMonth()].name} ${new Date().getFullYear()}`;

    const handleMonthChange = (dir) => {
        if (dir === 'next') {
            if (currentMonthIdx === 11) {
                setCurrentMonthIdx(0);
                setCurrentYear(prev => prev + 1);
            } else setCurrentMonthIdx(prev => prev + 1);
        } else {
            if (currentMonthIdx === 0) {
                setCurrentMonthIdx(11);
                setCurrentYear(prev => prev - 1);
            } else setCurrentMonthIdx(prev => prev - 1);
        }
    };

    const handleSave = () => {
        if (!newEntry.client) return;
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        const appId = Date.now();
        
        if (!clients.find(c => c.name.toLowerCase() === newEntry.client.toLowerCase())) {
            setClients([...clients, { 
                name: newEntry.client, phone: newEntry.phone, 
                social: newEntry.social, email: newEntry.email, id: appId 
            }]);
        }
        
        setAppointments([...appointments, { ...newEntry, date: fullDate, id: appId + 1 }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', time: '', date: '', price: '', phone: '', social: '', email: '', style: '' });
    };

    const deleteApp = (id) => {
        if (window.confirm("Obrisati termin?")) setAppointments(appointments.filter(a => a.id !== id));
    };

    const deleteClient = (id, e) => {
        e.stopPropagation(); // Sprečava otvaranje detalja klijenta pri kliku na X
        if (window.confirm("Obrisati klijenta iz baze?")) setClients(clients.filter(c => c.id !== id));
    };

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6">
                <h1 className="text-2xl font-black gold-text italic uppercase">INKFLOW PRO</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tattoo CRM</p>
            </header>

            <main className="p-4">
                {/* DASHBOARD */}
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-bg p-6 text-center shadow-lg border border-white/5">
                                <p className="text-2xl font-black gold-text">
                                    {appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear)).reduce((a, b) => a + (parseInt(b.price) || 0), 0)}€
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">Monthly Rev</p>
                            </div>
                            <div className="card-bg p-6 text-center shadow-lg border border-white/5">
                                <p className="text-2xl font-black">{appointments.filter(a => a.date === todayStr).length}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">Today</p>
                            </div>
                        </div>
                        <div className="card-bg p-6 shadow-xl border border-white/5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 italic text-center">Active Schedule</h3>
                            {appointments.filter(a => a.date === todayStr).length === 0 ? <p className="text-center opacity-20 py-10 italic">No jobs today</p> :
                                appointments.filter(a => a.date === todayStr).map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl mb-3 flex justify-between items-center border-l-4 border-yellow-500 shadow-md">
                                        <div>
                                            <p className="font-bold text-sm">{app.client}</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black">{app.time} | {app.style}</p>
                                        </div>
                                        <p className="gold-text font-black text-sm">{app.price}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* CALENDAR */}
                {activeTab === 'cal' && (
                    <div className="space-y-6">
                        <div className="card-bg p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800">
                                <button onClick={() => handleMonthChange('prev')} className="text-yellow-500 text-2xl font-black px-2"> &lt; </button>
                                <div className="text-center">
                                    <p className="font-black gold-text italic text-lg uppercase tracking-tighter">{currentMonthName}</p>
                                    <p className="text-[10px] text-slate-600 font-bold tracking-widest">{currentYear}</p>
                                </div>
                                <button onClick={() => handleMonthChange('next')} className="text-yellow-500 text-2xl font-black px-2"> &gt; </button>
                            </div>

                            <div className="flex overflow-x-auto no-scrollbar gap-2">
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => (
                                    <button key={day} onClick={() => setSelectedDate(day)}
                                        className={`flex-shrink-0 w-12 h-14 rounded-xl flex items-center justify-center transition-all ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500 border border-slate-800'}`}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card-bg p-6 min-h-[300px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-black gold-text uppercase italic">{selectedDate}. {currentMonthName} {currentYear}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1 rounded-full font-black text-[10px] uppercase shadow-lg">Add Session</button>
                            </div>
                            <div className="space-y-3">
                                {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).length === 0 ? 
                                    <p className="text-center opacity-20 py-10 italic">No appointments</p> :
                                    appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`)
                                    .sort((a,b) => a.time.localeCompare(b.time))
                                    .map(app => (
                                        <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center border border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-slate-500 border-r border-slate-800 pr-3">{app.time}</span>
                                                <div><p className="font-bold text-white text-sm">{app.client}</p><p className="text-[9px] text-slate-500 uppercase">{app.style}</p></div>
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

                {/* CLIENTS (CRM) */}
                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        {clients.length === 0 ? <p className="text-center opacity-20 py-20 italic">Empty Database</p> :
                            clients.map(c => (
                                <div key={c.id} onClick={() => setSelectedClientData(c)} className="card-bg p-5 flex justify-between items-center border border-slate-800/50 shadow-md active:scale-[0.98] transition-transform">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center text-black font-black">{c.name[0]}</div>
                                        <div>
                                            <p className="font-bold text-white">{c.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{c.social || '@no_tag'}</p>
                                        </div>
                                    </div>
                                    <button onClick={(e) => deleteClient(c.id, e)} className="text-red-900/40 p-3 text-xl hover:text-red-500 transition-colors">🗑️</button>
                                </div>
                            ))
                        }
                    </div>
                )}
            </main>

            {/* MODAL ZA DETALJE KLIJENTA */}
            {selectedClientData && (
                <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center p-6" onClick={() => setSelectedClientData(null)}>
                    <div className="card-bg w-full p-8 rounded-[40px] border border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-20 h-20 gold-bg rounded-full mx-auto flex items-center justify-center text-black text-3xl font-black mb-6 shadow-2xl">{selectedClientData.name[0]}</div>
                        <h2 className="text-2xl font-black text-center text-white uppercase mb-2 italic tracking-tighter">{selectedClientData.name}</h2>
                        <p className="text-center gold-text font-bold text-xs mb-8 tracking-[0.3em] uppercase">{selectedClientData.social}</p>
                        
                        <div className="space-y-4 bg-[#0a0f1d] p-6 rounded-3xl border border-slate-800 shadow-inner">
                            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 text-[10px] font-black uppercase">Phone:</span><span className="text-white font-bold">{selectedClientData.phone || 'N/A'}</span></div>
                            <div className="flex justify-between border-b border-slate-800 pb-2"><span className="text-slate-500 text-[10px] font-black uppercase">Email:</span><span className="text-white font-bold">{selectedClientData.email || 'N/A'}</span></div>
                        </div>
                        
                        <button onClick={() => setSelectedClientData(null)} className="w-full mt-8 bg-slate-800 text-slate-400 font-black p-5 rounded-2xl uppercase tracking-widest text-[10px]">Close Profile</button>
                    </div>
                </div>
            )}

            {/* MODAL ZA ZAKAZIVANJE - SA CANCEL DUGMETOM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end" onClick={() => setIsModalOpen(false)}>
                    <div className="card-bg w-full p-8 rounded-t-[40px] border-t border-slate-800 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-1 bg-slate-800 mx-auto mb-8 rounded-full"></div>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center">{selectedDate}. {currentMonthName} {currentYear}</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none font-bold text-white text-center shadow-inner" 
                                onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <input type="text" placeholder="Tattoo Style" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center text-sm shadow-inner" 
                                onChange={e => setNewEntry({...newEntry, style: e.target.value})} />
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Time</p>
                                    <input type="time" className="w-full bg-transparent font-bold text-yellow-500 text-center outline-none" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                </div>
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl text-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Price</p>
                                    <input type="number" placeholder="€" className="w-full bg-transparent font-bold text-white text-center outline-none" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                                </div>
                            </div>

                            <button onClick={handleSave} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-6 shadow-2xl">Confirm Session</button>
                            {/* CANCEL DUGME */}
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-red-900/60 font-black p-4 uppercase tracking-[0.3em] text-[10px]">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-4 shadow-2xl z-50 rounded-3xl">
                {['dash', 'cal', 'biz', 'crm'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] font-black uppercase tracking-widest ${activeTab === tab ? 'gold-text' : 'text-slate-600'}`}>
                        {tab === 'dash' ? 'Home' : tab === 'cal' ? 'Calendar' : tab === 'biz' ? 'Business' : 'Clients'}
                    </button>
                ))}
            </nav>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
