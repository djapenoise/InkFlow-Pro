const { useState, useEffect } = React;

// --- AUTH KOMPONENTA ---
function AuthScreen({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (!email || !password) return alert("Popunite polja!");
        const users = JSON.parse(localStorage.getItem('inkflow_users') || '[]');
        if (isLogin) {
            const user = users.find(u => u.email === email && u.password === password);
            if (user) onLogin(user);
            else alert("Pogrešan email ili lozinka!");
        } else {
            if (users.find(u => u.email === email)) return alert("Email već postoji!");
            const newUser = { email, password };
            users.push(newUser);
            localStorage.setItem('inkflow_users', JSON.stringify(users));
            onLogin(newUser);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <div className="card-bg w-full max-w-md p-8 border border-slate-800 rounded-[40px] text-center shadow-2xl">
                <h1 className="text-3xl font-black gold-text italic tracking-tighter mb-2">INKFLOW PRO</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-8">by Djape Noise</p>
                <div className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" onChange={e => setPassword(e.target.value)} />
                    <button onClick={handleSubmit} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4 shadow-xl">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                    <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-slate-500 font-black uppercase mt-4 block mx-auto underline italic">
                        {isLogin ? 'New here? Create Account' : 'Already have account? Log In'}
                    </button>
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
    
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    // Dinamički ključevi za svakog korisnika posebno
    const storageKeyApps = user ? `inkflow_apps_${user.email}` : null;
    const storageKeyClients = user ? `inkflow_clients_${user.email}` : null;

    const [appointments, setAppointments] = useState(() => {
        const saved = localStorage.getItem(storageKeyApps);
        return saved ? JSON.parse(saved) : [];
    });

    const [clients, setClients] = useState(() => {
        const saved = localStorage.getItem(storageKeyClients);
        return saved ? JSON.parse(saved) : [];
    });

    // Forme sa svim traženim poljima
    const [newEntry, setNewEntry] = useState({ client: '', style: '', time: '', price: '', phone: '', email: '' });
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', social: '' });

    useEffect(() => {
        if (user) {
            localStorage.setItem(storageKeyApps, JSON.stringify(appointments));
            localStorage.setItem(storageKeyClients, JSON.stringify(clients));
            localStorage.setItem('inkflow_logged_user', JSON.stringify(user));
        }
    }, [appointments, clients, user]);

    if (!user) return <AuthScreen onLogin={setUser} />;

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
            if (currentMonthIdx === 11) { setCurrentMonthIdx(0); setCurrentYear(prev => prev + 1); }
            else setCurrentMonthIdx(prev => prev + 1);
        } else {
            if (currentMonthIdx === 0) { setCurrentMonthIdx(11); setCurrentYear(prev => prev - 1); }
            else setCurrentMonthIdx(prev => prev - 1);
        }
    };

    const handleSaveAppointment = () => {
        if (!newEntry.client) return alert("Ime klijenta je obavezno!");
        const fullDate = `${selectedDate}. ${currentMonthName} ${currentYear}`;
        
        // Automatsko dodavanje klijenta u bazu ako ne postoji
        if (!clients.find(c => c.name.toLowerCase() === newEntry.client.toLowerCase())) {
            setClients([...clients, { name: newEntry.client, phone: newEntry.phone, email: newEntry.email, id: Date.now() }]);
        }

        setAppointments([...appointments, { ...newEntry, date: fullDate, id: Date.now() + 1 }]);
        setIsModalOpen(false);
        setNewEntry({ client: '', style: '', time: '', price: '', phone: '', email: '' });
    };

    const handleAddClient = () => {
        if (!newClient.name) return alert("Ime je obavezno!");
        setClients([...clients, { ...newClient, id: Date.now() }]);
        setIsClientModalOpen(false);
        setNewClient({ name: '', phone: '', email: '', social: '' });
    };

    return (
        <div className="min-h-screen pb-32 bg-[#020617] text-white font-sans">
            <header className="p-6 flex justify-between items-start border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-[#020617]/80">
                <div>
                    <h1 className="text-2xl font-black gold-text italic tracking-tighter">INKFLOW PRO</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">by Djape Noise</p>
                </div>
                <button onClick={() => {localStorage.removeItem('inkflow_logged_user'); setUser(null);}} className="bg-slate-800 text-slate-400 px-3 py-2 rounded-full font-black text-[8px] uppercase">Logout</button>
            </header>

            <main className="p-4">
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card-bg p-6 text-center border border-white/5">
                                <p className="text-2xl font-black gold-text">
                                    {appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear)).reduce((s, a) => s + (parseInt(a.price) || 0), 0)}€
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Month Rev</p>
                            </div>
                            <div className="card-bg p-6 text-center border border-white/5">
                                <p className="text-2xl font-black text-white">{appointments.filter(a => a.date === todayStr).length}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Today</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cal' && (
                    <div className="space-y-6">
                        <div className="card-bg p-6 border border-white/5">
                            <div className="flex justify-between items-center mb-6 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800">
                                <button onClick={() => handleMonthChange('prev')} className="gold-text text-2xl font-black px-2"> &lt; </button>
                                <div className="text-center">
                                    <p className="font-black gold-text italic uppercase">{currentMonthName}</p>
                                    <p className="text-[10px] text-slate-700 font-bold">{currentYear}</p>
                                </div>
                                <button onClick={() => handleMonthChange('next')} className="gold-text text-2xl font-black px-2"> &gt; </button>
                            </div>
                            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => (
                                    <button key={day} onClick={() => setSelectedDate(day)}
                                        className={`flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center relative transition-all ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500 border border-slate-800'}`}>
                                        <span className="text-sm">{day}</span>
                                        {appointments.some(a => a.date === `${day}. ${currentMonthName} ${currentYear}`) && <div className={`w-1.5 h-1.5 rounded-full absolute bottom-2 ${selectedDate === day ? 'bg-black' : 'bg-yellow-500 animate-pulse'}`}></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="card-bg p-6 border border-white/5 min-h-[300px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-black gold-text uppercase italic tracking-tighter">{selectedDate}. {currentMonthName}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase shadow-lg">Add Session</button>
                            </div>
                            <div className="space-y-3">
                                {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center border border-slate-800">
                                        <div><p className="font-bold text-white text-sm">{app.client}</p><p className="text-[9px] text-slate-500 uppercase">{app.time} | {app.style}</p></div>
                                        <div className="flex gap-3">
                                            <span className="gold-text font-black text-xs">{app.price}</span>
                                            <button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="text-red-900/40 text-xl px-1">×</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'biz' && (
                    <div className="space-y-6">
                        <div className="card-bg p-6 border border-white/5">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase text-center mb-4 tracking-[0.2em]">Yearly Analysis {currentYear}</h3>
                            {months.map(m => {
                                const rev = appointments.filter(a => a.date.includes(m.name) && a.date.includes(currentYear)).reduce((s, a) => s + (parseInt(a.price) || 0), 0);
                                return (
                                    <div key={m.name} className="flex justify-between p-3 border-b border-white/5 text-[10px] font-black uppercase">
                                        <span className="text-slate-500">{m.name}</span>
                                        <span className="text-white">{rev}€</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        <button onClick={() => setIsClientModalOpen(true)} className="w-full gold-bg text-black p-4 rounded-2xl font-black uppercase text-xs mb-4 shadow-xl">Add New Client</button>
                        {clients.map(c => (
                            <div key={c.id} className="card-bg p-5 flex justify-between items-center border border-slate-800">
                                <div><p className="font-bold text-white">{c.name}</p><p className="text-[9px] text-slate-500 uppercase">{c.social || '@no_instagram'}</p></div>
                                <button onClick={() => setClients(clients.filter(cl => cl.id !== c.id))} className="opacity-20">🗑️</button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* --- MODAL ZA NOVU SESIJU (Sa svim poljima + Cancel) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center p-6 shadow-2xl overflow-y-auto">
                    <div className="card-bg w-full p-8 rounded-[40px] border border-slate-800 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-black gold-text uppercase italic mb-6 text-center">New Session Details</h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name" className="w-full bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center font-bold" 
                                onChange={e => setNewEntry({...newEntry, client: e.target.value})} />
                            <input type="text" placeholder="Tattoo Style" className="w-full bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-sm" 
                                onChange={e => setNewEntry({...newEntry, style: e.target.value})} />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="time" className="bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-yellow-500 font-black text-center" 
                                    onChange={e => setNewEntry({...newEntry, time: e.target.value})} />
                                <input type="number" placeholder="Price (€)" className="bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center font-black" 
                                    onChange={e => setNewEntry({...newEntry, price: e.target.value + '€'})} />
                            </div>
                            <input type="tel" placeholder="Phone" className="w-full bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-xs" 
                                onChange={e => setNewEntry({...newEntry, phone: e.target.value})} />
                            <input type="email" placeholder="Email" className="w-full bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-xs" 
                                onChange={e => setNewEntry({...newEntry, email: e.target.value})} />
                            
                            <button onClick={handleSaveAppointment} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-6 shadow-xl">Confirm Session</button>
                            <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-600 font-black p-2 uppercase text-[9px] mt-2 underline italic">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ZA NOVOG KLIJENTA (Sa svim poljima + Cancel) --- */}
            {isClientModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center p-6 shadow-2xl">
                    <div className="card-bg w-full p-8 rounded-[40px] border border-slate-800">
                        <h2 className="text-xl font-black gold-text uppercase italic mb-6 text-center">New Client Profile</h2>
                        <div className="space-y-3">
                            <input type="text" placeholder="Full Name" className="w-full bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center font-bold" 
                                onChange={e => setNewClient({...newClient, name: e.target.value})} />
                            <input type="tel" placeholder="Phone" className="w-full bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-sm" 
                                onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                            <input type="email" placeholder="Email" className="w-full bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-sm" 
                                onChange={e => setNewClient({...newClient, email: e.target.value})} />
                            <input type="text" placeholder="Instagram @tag" className="w-full bg-[#0a0f1d] border border-slate-800 p-4 rounded-2xl outline-none text-white text-center text-sm" 
                                onChange={e => setNewClient({...newClient, social: e.target.value})} />
                            
                            <button onClick={handleAddClient} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-6 shadow-xl">Save Profile</button>
                            <button onClick={() => setIsClientModalOpen(false)} className="w-full text-slate-600 font-black p-2 uppercase text-[9px] mt-2 underline italic">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-8 left-6 right-6 card-bg border border-white/5 flex justify-around p-4 rounded-3xl backdrop-blur-md shadow-2xl z-50">
                {['dash', 'cal', 'biz', 'crm'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'gold-text scale-110' : 'text-slate-600'}`}>
                        {tab === 'dash' ? 'Home' : tab === 'cal' ? 'Calendar' : tab === 'biz' ? 'Biz' : 'Clients'}
                    </button>
                ))}
            </nav>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
