const { useState, useEffect } = React;

// --- POMOĆNA KOMPONENTA ZA BUSINESS TAB ---
function BusinessOverview({ appointments, currentMonthName, currentYear }) {
    const monthApps = appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear));
    const totalRev = monthApps.reduce((sum, a) => sum + (parseInt(a.price) || 0), 0);
    
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="card-bg p-8 border border-white/5 shadow-2xl relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 gold-bg opacity-5 blur-[50px] rounded-full"></div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Monthly Revenue</h3>
                <p className="text-5xl font-black gold-text italic tracking-tighter">{totalRev}€</p>
                <p className="text-[10px] text-slate-600 font-bold mt-4 uppercase tracking-widest">{currentMonthName} {currentYear}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="card-bg p-6 border border-white/5">
                    <p className="text-2xl font-black text-white">{monthApps.length}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Sessions</p>
                </div>
                <div className="card-bg p-6 border border-white/5">
                    <p className="text-2xl font-black text-white">{monthApps.length > 0 ? Math.round(totalRev / monthApps.length) : 0}€</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Avg / Job</p>
                </div>
            </div>
        </div>
    );
}

// --- GLAVNA APLIKACIJA ---
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

    const [newEntry, setNewEntry] = useState({ client: '', time: '', date: '', price: '', phone: '', email: '', style: '' });
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', social: '' });

    useEffect(() => { localStorage.setItem('inkflow_appointments', JSON.stringify(appointments)); }, [appointments]);
    useEffect(() => { localStorage.setItem('inkflow_clients', JSON.stringify(clients)); }, [clients]);

    const months = [
        { name: "JANUAR", days: 31 }, { name: "FEBRUAR", days: 28 }, { name: "MART", days: 31 },
        { name: "APRIL", days: 30 }, { name: "MAJ", days: 31 }, { name: "JUN", days: 30 },
        { name: "JUL", days: 31 }, { name: "AVGUST", days: 31 }, { name: "SEPTEMBAR", days: 30 },
        { name: "OKTOBAR", days: 31 }, { name: "NOVEMBAR", days: 30 }, { name: "DECEMBAR", days: 31 }
    ];

    const currentMonthName = months[currentMonthIdx].name;
    const todayStr = `${new Date().getDate()}. ${months[new Date().getMonth()].name} ${new Date().getFullYear()}`;

    // Funkcija koja proverava da li dan ima zakazivanja
    const hasAppointment = (day) => {
        const fullDateStr = `${day}. ${currentMonthName} ${currentYear}`;
        return appointments.some(app => app.date === fullDateStr);
    };

    const handleMonthChange = (dir) => {
        if (dir === 'next') {
            if (currentMonthIdx === 11) { setCurrentMonthIdx(0); setCurrentYear(prev => prev + 1); }
            else setCurrentMonthIdx(prev => prev + 1);
        } else {
            if (currentMonthIdx === 0) { setCurrentMonthIdx(11); setCurrentYear(prev => prev - 1); }
            else setCurrentMonthIdx(prev => prev - 1);
        }
    };

    const handleSaveAppointment = () => {
        if (!newEntry.client) return;
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        const appId = Date.now();
        if (!clients.find(c => c.name.toLowerCase() === newEntry.client.toLowerCase())) {
            setClients([...clients, { name: newEntry.client, phone: newEntry.phone, email: newEntry.email, id: appId }]);
        }
        setAppointments([...appointments, { ...newEntry, date: fullDate, id: appId + 1 }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', time: '', date: '', price: '', phone: '', email: '', style: '' });
    };

    const handleAddClient = () => {
        if (!newClient.name) return;
        setClients([...clients, { ...newClient, id: Date.now() }]);
        setIsClientModalOpen(false);
        setNewClient({ name: '', phone: '', email: '', social: '' });
    };

    const deleteApp = (id) => { if (window.confirm("Obrisati termin?")) setAppointments(appointments.filter(a => a.id !== id)); };
    const deleteClient = (id, e) => { e.stopPropagation(); if (window.confirm("Obrisati klijenta?")) setClients(clients.filter(c => c.id !== id)); };

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black gold-text italic uppercase leading-none tracking-tighter">INKFLOW PRO</h1>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Management</p>
                </div>
                {activeTab === 'crm' && (
                    <button onClick={() => setIsClientModalOpen(true)} className="gold-bg text-black px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg active:scale-90 transition-transform">Add</button>
                )}
            </header>

            <main className="p-4">
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-bg p-6 text-center">
                                <p className="text-2xl font-black gold-text">
                                    {appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear)).reduce((a, b) => a + (parseInt(b.price) || 0), 0)}€
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Month Rev</p>
                            </div>
                            <div className="card-bg p-6 text-center">
                                <p className="text-2xl font-black text-white">{appointments.filter(a => a.date === todayStr).length}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Today</p>
                            </div>
                        </div>
                        <div className="card-bg p-6 border border-white/5">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 text-center italic border-b border-white/5 pb-4">Today's Schedule</h3>
                            {appointments.filter(a => a.date === todayStr).length === 0 ? <p className="text-center opacity-20 py-10 italic">No jobs today</p> :
                                appointments.filter(a => a.date === todayStr).map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl mb-3 flex justify-between items-center border-l-4 border-yellow-500">
                                        <div><p className="font-bold text-sm text-white">{app.client}</p><p className="text-[10px] text-slate-500 uppercase font-black">{app.time} | {app.style}</p></div>
                                        <p className="gold-text font-black text-sm">{app.price}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {activeTab === 'cal' && (
                    <div className="space-y-6">
                        <div className="card-bg p-6">
                            <div className="flex justify-between items-center mb-6 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800">
                                <button onClick={() => handleMonthChange('prev')} className="text-yellow-500 text-2xl font-black px-2"> &lt; </button>
                                <div className="text-center">
                                    <p className="font-black gold-text italic text-lg uppercase tracking-tighter">{currentMonthName}</p>
                                    <p className="text-[10px] text-slate-700 font-bold tracking-widest">{currentYear}</p>
                                </div>
                                <button onClick={() => handleMonthChange('next')} className="text-yellow-500 text-2xl font-black px-2"> &gt; </button>
                            </div>
                            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => {
                                    const booked = hasAppointment(day);
                                    return (
                                        <button key={day} onClick={() => setSelectedDate(day)}
                                            className={`flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center transition-all relative ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500 border border-slate-800'}`}>
                                            <span className="text-sm">{day}</span>
                                            {booked && (
                                                <div className={`w-1.5 h-1.5 rounded-full absolute bottom-2 ${selectedDate === day ? 'bg-black' : 'bg-yellow-500 animate-pulse'}`}></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="card-bg p-6 min-h-[300px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-black gold-text uppercase italic tracking-tighter">{selectedDate}. {currentMonthName} {currentYear}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1 rounded-full font-black text-[10px] uppercase">Add Session</button>
                            </div>
                            <div className="space-y-3">
                                {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).length === 0 ? 
                                    <p className="text-center opacity-20 py-10 italic">No appointments</p> :
                                    appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`)
                                    .sort((a,b) => a.time.localeCompare(b.time))
                                    .map(app => (
                                        <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center border border-slate-800 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-slate-500 border-r border-slate-800 pr-3">{app.time}</span>
                                                <div><p className="font-bold text-white text-sm">{app.client}</p><p className="text-[9px] text-slate-500 uppercase">{app.style}</p></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="gold-text font-black text-xs">{app.price}</span>
                                                <button onClick={() => deleteApp(app.id)} className="text-red-900/40 text-xl px-1">×</button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'biz' && <BusinessOverview appointments={appointments} currentMonthName={currentMonthName} currentYear={currentYear} />}

                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        {clients.length === 0 ? <p className="text-center opacity-20 py-20 italic">No clients yet</p> :
                            clients.map(c => (
                                <div key={c.id} onClick={() => setSelectedClientData(c)} className="card-bg p-5 flex justify-between items-center border border-slate-800 shadow-md active:scale-95 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center text-black font-black">{c.name[0]}</div>
                                        <div><p className="font-bold text-white">{c.name}</p><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{c.social || '@ink_client'}</p></div>
                                    </div>
                                    <button onClick={(e) => deleteClient(c.id, e)} className="p-3 grayscale opacity-30 hover:opacity-100 transition-opacity">🗑️</button>
                                </div>
                            ))
                        }
                    </div>
                )}
            </main>

            {/* MODAL ZA NOVOG KLIJENTA (CRM) */}
            {isClientModalOpen && (
                <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center p-6 animate-in fade-in duration-300" onClick={() => setIsClientModalOpen(false)}>
                    <div className="card-bg w-full p-8 rounded-[40px] border border-slate-800" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center">New Client Profile</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Full Name" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none font-bold text-white text-center shadow-inner" 
                                onChange={e => setNewClient({...newClient, name: e.target.value})} />
                            <input type="tel" placeholder="Phone Number" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center text-sm shadow-inner" 
                                onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                            <input type="email" placeholder="Email Address" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center text-sm shadow-inner" 
                                onChange={e => setNewClient({...newClient, email: e.target.value})} />
                            <input type="text" placeholder="Instagram @tag" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center text-sm shadow-inner" 
                                onChange={e => setNewClient({...newClient, social: e.target.value})} />
                            <button onClick={handleAddClient} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-6 shadow-2xl active:scale-95 transition-all">Save Profile</button>
                            <button onClick={() => setIsClientModalOpen(false)} className="w-full text-slate-600 font-black p-2 uppercase tracking-widest text-[9px] mt-2">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ZA DETALJE KLIJENTA */}
            {selectedClientData && (
                <div className="fixed inset-0 z-[130] bg-black/95 backdrop-blur-xl flex items-center p-6 animate-in fade-in duration-300" onClick={() => setSelectedClientData(null)}>
                    <div className="card-bg w-full p-8 rounded-[40px] border border-slate-800" onClick={e => e.stopPropagation()}>
                        <div className="w-20 h-20 gold-bg rounded-full mx-auto flex items-center justify-center text-black text-3xl font-black mb-6 shadow-2xl">{selectedClientData.name[0]}</div>
                        <h2 className="text-2xl font-black text-center text-white uppercase mb-2 italic tracking-tighter">{selectedClientData.name}</h2>
                        <p className="text-center gold-text font-bold text-[10px] mb-8 tracking-[0.3em] uppercase">{selectedClientData.social || '@ink_client'}</p>
                        <div className="space-y-3 bg-[#0a0f1d] p-6 rounded-3xl border border-slate-800 shadow-inner mb-6 text-center">
                            <p className="text-slate-600 text-[9px] font-black uppercase">Phone</p><p className="text-white font-bold tracking-widest mb-3">{selectedClientData.phone || '—'}</p>
                            <p className="text-slate-600 text-[9px] font-black uppercase">Email</p><p className="text-white font-bold text-xs">{selectedClientData.email || '—'}</p>
                        </div>
                        <button onClick={() => setSelectedClientData(null)} className="w-full bg-slate-800 text-slate-500 font-black p-5 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Close</button>
                    </div>
                </div>
            )}

            {/* MODAL ZA ZAKAZIVANJE */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end animate-in slide-in-from-bottom duration-500" onClick={() => setIsModalOpen(false)}>
                    <div className="card-bg w-full p-8 rounded-t-[40px] border-t border-slate-800 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-1 bg-slate-800 mx-auto mb-8 rounded-full"></div>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center">{selectedDate}. {currentMonthName} {currentYear}</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none font-bold text-white text-center shadow-inner" 
                                onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <input type="text" placeholder="Tattoo Style" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center text-sm shadow-inner" 
                                onChange={e => setNewEntry({...newEntry, style: e.target.value})} />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="tel" placeholder="Phone" className="bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-xs text-white text-center shadow-inner" 
                                    onChange={e => setNewEntry({...newEntry, phone: e.target.value})} />
                                <input type="email" placeholder="Email" className="bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-xs text-white text-center shadow-inner" 
                                    onChange={e => setNewEntry({...newEntry, email: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl relative h-20 flex flex-col justify-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase absolute top-2 left-0 right-0 tracking-widest">Time</p>
                                    <input type="time" className="bg-transparent font-black text-yellow-500 text-center outline-none text-lg mt-2" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                </div>
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl relative h-20 flex flex-col justify-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase absolute top-2 left-0 right-0 tracking-widest">Price</p>
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <input type="number" placeholder="0" className="w-12 bg-transparent font-black text-white text-center outline-none text-lg" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                                        <span className="text-white font-black text-sm">€</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleSaveAppointment} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-6 shadow-2xl active:scale-95 transition-all">Confirm Session</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-600 font-black p-4 uppercase tracking-[0.3em] text-[10px]">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-4 shadow-2xl z-50 rounded-3xl backdrop-blur-md">
                {['dash', 'cal', 'biz', 'crm'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'gold-text scale-110' : 'text-slate-600 opacity-50'}`}>
                        {tab === 'dash' ? 'Home' : tab === 'cal' ? 'Calendar' : tab === 'biz' ? 'Business' : 'Clients'}
                    </button>
                ))}
            </nav>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
