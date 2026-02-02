const { useState, useEffect } = React;

// --- LOGIN KOMPONENTA ---
function AuthScreen({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (!email || !password) return alert("Popunite polja!");
        const users = JSON.parse(localStorage.getItem('inkflow_users') || '[]');
        const cleanEmail = email.toLowerCase().trim();
        
        if (isLogin) {
            const user = users.find(u => u.email === cleanEmail && u.password === password);
            if (user) {
                localStorage.setItem('inkflow_logged_user', JSON.stringify(user));
                window.location.reload(); // OSVEŽAVA STRANICU DA OČISTI MEMORIJU
            } else alert("Pogrešan email ili lozinka!");
        } else {
            if (users.find(u => u.email === cleanEmail)) return alert("Email već postoji!");
            const newUser = { email: cleanEmail, password };
            users.push(newUser);
            localStorage.setItem('inkflow_users', JSON.stringify(users));
            localStorage.setItem('inkflow_logged_user', JSON.stringify(newUser));
            window.location.reload(); // OSVEŽAVA STRANICU NAKON SIGN UP-A
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
            <div className="card-bg w-full max-w-md p-10 rounded-[50px] border border-white/5 text-center shadow-2xl">
                <h1 className="text-4xl font-black gold-text italic tracking-tighter mb-2">INKFLOW</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mb-12">Private Studio Access</p>
                <div className="space-y-4">
                    <input type="email" placeholder="Artist Email" className="w-full bg-[#0a0f1d] border border-white/5 p-5 rounded-3xl outline-none text-center font-bold" onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full bg-[#0a0f1d] border border-white/5 p-5 rounded-3xl outline-none text-center font-bold" onChange={e => setPassword(e.target.value)} />
                    <button onClick={handleSubmit} className="w-full gold-bg text-black font-black p-5 rounded-3xl uppercase tracking-widest mt-4 shadow-2xl"> {isLogin ? 'Login' : 'Sign Up'} </button>
                    <button onClick={() => setIsLogin(!isLogin)} className="text-[9px] text-slate-600 font-bold uppercase mt-6 block mx-auto tracking-widest"> {isLogin ? 'Switch to Sign Up' : 'Switch to Login'} </button>
                </div>
            </div>
        </div>
    );
}

// --- BUSINESS TAB ANALIZA ---
function BusinessOverview({ appointments, currentMonthName, currentYear, months }) {
    const monthApps = appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear.toString()));
    const totalRev = monthApps.reduce((sum, a) => sum + (parseInt(a.price) || 0), 0);
    
    const yearlyStats = months.map(m => {
        const apps = appointments.filter(a => a.date.includes(m.name) && a.date.includes(currentYear.toString()));
        const rev = apps.reduce((sum, a) => sum + (parseInt(a.price) || 0), 0);
        return { name: m.name, count: apps.length, rev: rev };
    });

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
            <div className="card-bg p-6 border border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 italic border-b border-white/5 pb-3 text-center">Yearly Performance ({currentYear})</h3>
                <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-2">
                    {yearlyStats.map(m => (
                        <div key={m.name} className={`flex justify-between items-center p-3 rounded-xl ${m.name === currentMonthName ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-[#0a0f1d]'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`text-[9px] font-black ${m.name === currentMonthName ? 'gold-text' : 'text-slate-600'}`}>{m.name.slice(0, 3)}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{m.count} SESSIONS</span>
                            </div>
                            <span className={`font-black text-xs ${m.rev > 0 ? 'text-white' : 'text-slate-800'}`}>{m.rev}€</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- GLAVNA APLIKACIJA ---
function App() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('inkflow_logged_user')));
    const [activeTab, setActiveTab] = useState('dash');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isEditClientOpen, setIsEditClientOpen] = useState(false);
    const [selectedClientData, setSelectedClientData] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    // KLJUČNA IZMENA: Podaci se odmah vuku iz ispravnog storage ključa pri prvom renderovanju
    const storageKeyApps = user ? `inkflow_apps_${user.email}` : null;
    const storageKeyClients = user ? `inkflow_clients_${user.email}` : null;

    const [appointments, setAppointments] = useState(() => {
        if (!user) return [];
        return JSON.parse(localStorage.getItem(`inkflow_apps_${user.email}`) || '[]');
    });

    const [clients, setClients] = useState(() => {
        if (!user) return [];
        return JSON.parse(localStorage.getItem(`inkflow_clients_${user.email}`) || '[]');
    });

    const [newEntry, setNewEntry] = useState({ client: '', time: '', date: '', price: '', phone: '', email: '', style: '' });
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', social: '' });

    // Čuvanje podataka SAMO ako je korisnik ulogovan i u ispravan ključ
    useEffect(() => { 
        if(user && storageKeyApps) {
            localStorage.setItem(storageKeyApps, JSON.stringify(appointments));
        }
    }, [appointments]);

    useEffect(() => { 
        if(user && storageKeyClients) {
            localStorage.setItem(storageKeyClients, JSON.stringify(clients));
        }
    }, [clients]);

    if (!user) return <AuthScreen onLogin={setUser} />;

    const months = [
        { name: "JANUAR", days: 31 }, { name: "FEBRUAR", days: 28 }, { name: "MART", days: 31 },
        { name: "APRIL", days: 30 }, { name: "MAJ", days: 31 }, { name: "JUN", days: 30 },
        { name: "JUL", days: 31 }, { name: "AVGUST", days: 31 }, { name: "SEPTEMBAR", days: 30 },
        { name: "OKTOBAR", days: 31 }, { name: "NOVEMBAR", days: 30 }, { name: "DECEMBAR", days: 31 }
    ];

    const currentMonthName = months[currentMonthIdx].name;
    const todayStr = `${new Date().getDate()}. ${months[new Date().getMonth()].name} ${new Date().getFullYear()}`;

    const handleMonthChange = (direction) => {
        if (direction === 'next') {
            if (currentMonthIdx === 11) { setCurrentMonthIdx(0); setCurrentYear(prev => prev + 1); }
            else { setCurrentMonthIdx(prev => prev + 1); }
        } else {
            if (currentMonthIdx === 0) { setCurrentMonthIdx(11); setCurrentYear(prev => prev - 1); }
            else { setCurrentMonthIdx(prev => prev - 1); }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('inkflow_logged_user');
        window.location.reload(); // POTPUNI RESET PRI LOGOUTU
    };

    const handleSaveAppointment = () => {
        if (!newEntry.client) return;
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        const appId = Date.now();
        if (!clients.find(c => c.name.toLowerCase() === newEntry.client.toLowerCase())) {
            setClients([...clients, { name: newEntry.client, phone: newEntry.phone, email: newEntry.email, id: appId, social: '' }]);
        }
        setAppointments([...appointments, { ...newEntry, date: fullDate, id: appId + 1 }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', time: '', date: '', price: '', phone: '', email: '', style: '' });
    };

    const handleUpdateClient = () => {
        setClients(clients.map(c => c.id === editingClient.id ? editingClient : c));
        setIsEditClientOpen(false);
        setEditingClient(null);
    };

    const deleteApp = (id) => { if (window.confirm("Obrisati termin?")) setAppointments(appointments.filter(a => a.id !== id)); };
    const deleteClient = (id, e) => { e.stopPropagation(); if (window.confirm("Obrisati klijenta?")) setClients(clients.filter(c => c.id !== id)); };

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6 flex justify-between items-center">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <h1 className="text-2xl font-black gold-text italic uppercase leading-none tracking-tighter">INKFLOW</h1>
                        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">by Djape Noise</span>
                    </div>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em] mt-1">TATTOO MANAGEMENT</p>
                </div>
                <button onClick={handleLogout} className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[8px] uppercase font-black">Out</button>
            </header>

            <main className="p-4">
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black gold-text">
                                    {appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear.toString())).reduce((a, b) => a + (parseInt(b.price) || 0), 0)}€
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Month Rev</p>
                            </div>
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black text-white">{appointments.filter(a => a.date === todayStr).length}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Today</p>
                            </div>
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
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => (
                                    <button key={day} onClick={() => setSelectedDate(day)}
                                        className={`flex-shrink-0 w-12 h-16 rounded-xl flex items-center justify-center ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500 border border-slate-800'}`}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="card-bg p-6 min-h-[300px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-black gold-text uppercase italic tracking-tighter">{selectedDate}. {currentMonthName} {currentYear}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1 rounded-full font-black text-[10px] uppercase">Add Session</button>
                            </div>
                            {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).map(app => (
                                <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center border border-slate-800 mb-2">
                                    <div><p className="font-bold text-white text-sm">{app.client}</p><p className="text-[9px] text-slate-500 uppercase">{app.time} | {app.style}</p></div>
                                    <div className="flex items-center gap-3">
                                        <span className="gold-text font-black text-xs">{app.price}</span>
                                        <button onClick={() => deleteApp(app.id)} className="text-red-900/40 text-xl px-1">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'biz' && <BusinessOverview appointments={appointments} currentMonthName={currentMonthName} currentYear={currentYear} months={months} />}

                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        <button onClick={() => setIsClientModalOpen(true)} className="w-full gold-bg text-black font-black p-4 rounded-2xl uppercase text-[10px] mb-4">Add New Client</button>
                        {clients.map(c => (
                            <div key={c.id} className="card-bg p-5 flex justify-between items-center border border-slate-800 shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center text-black font-black">{c.name[0]}</div>
                                    <p className="font-bold text-white">{c.name}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingClient(c); setIsEditClientOpen(true); }} className="opacity-30">✏️</button>
                                    <button onClick={(e) => deleteClient(c.id, e)} className="opacity-30">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODALI (Isti dizajn kao pre) */}
            {isEditClientOpen && editingClient && (
                <div className="fixed inset-0 z-[140] bg-black/95 flex items-center p-6">
                    <div className="card-bg w-full p-8 rounded-[40px] border border-slate-800">
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center">Edit Profile</h2>
                        <div className="space-y-4">
                            <input type="text" value={editingClient.name} className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-white text-center shadow-inner" onChange={e => setEditingClient({...editingClient, name: e.target.value})} />
                            <input type="tel" value={editingClient.phone} className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-white text-center shadow-inner" onChange={e => setEditingClient({...editingClient, phone: e.target.value})} />
                            <input type="text" value={editingClient.social} className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-white text-center shadow-inner" onChange={e => setEditingClient({...editingClient, social: e.target.value})} />
                            <button onClick={handleUpdateClient} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase mt-4">Update</button>
                            <button onClick={() => setIsEditClientOpen(false)} className="w-full text-slate-600 font-black p-2 uppercase text-[9px] mt-2 text-center tracking-widest">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center p-6" onClick={() => setIsModalOpen(false)}>
                    <div className="card-bg w-full p-8 rounded-[40px] border border-slate-800" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center">Add Session</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Client Name" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-white text-center shadow-inner font-bold" onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <input type="text" placeholder="Tattoo Style" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-white text-center shadow-inner text-sm" onChange={e => setNewEntry({...newEntry, style: e.target.value})} />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl text-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Time</p>
                                    <input type="time" className="bg-transparent font-black text-yellow-500 text-center outline-none" onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                </div>
                                <div className="bg-[#0a0f1d] border border-slate-800 p-3 rounded-2xl text-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Price €</p>
                                    <input type="number" className="w-full bg-transparent font-black text-white text-center outline-none" onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                                </div>
                            </div>
                            <button onClick={handleSaveAppointment} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase mt-4 shadow-2xl">Confirm Session</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-4 rounded-3xl backdrop-blur-md">
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
