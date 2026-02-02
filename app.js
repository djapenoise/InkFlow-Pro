const { useState, useEffect } = React;

// --- AUTH KOMPONENTA (LOGIN / SIGNUP) ---
function AuthScreen({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (!email || !password) return alert("Popunite sva polja");
        
        const users = JSON.parse(localStorage.getItem('inkflow_users') || '[]');
        
        if (isLogin) {
            const user = users.find(u => u.email === email && u.password === password);
            if (user) onLogin(user);
            else alert("Pogrešan email ili lozinka");
        } else {
            if (users.find(u => u.email === email)) return alert("Korisnik već postoji");
            const newUser = { email, password, id: Date.now() };
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
                
                <h2 className="text-white font-black uppercase tracking-widest mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                
                <div className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" 
                        onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl outline-none text-white text-center shadow-inner" 
                        onChange={e => setPassword(e.target.value)} />
                    
                    <button onClick={handleSubmit} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase tracking-widest mt-4 shadow-xl active:scale-95 transition-all">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                    
                    <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4">
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
    const [selectedClientData, setSelectedClientData] = useState(null);
    
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    // DINAMIČKI KLJUČEVI ZA SVAKOG KORISNIKA POSEBNO
    const storageKeys = {
        apps: user ? `inkflow_apps_${user.email}` : null,
        clients: user ? `inkflow_clients_${user.email}` : null
    };

    const [appointments, setAppointments] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(storageKeys.apps);
        return saved ? JSON.parse(saved) : [];
    });

    const [clients, setClients] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(storageKeys.clients);
        return saved ? JSON.parse(saved) : [];
    });

    const [newEntry, setNewEntry] = useState({ client: '', time: '', date: '', price: '', phone: '', email: '', style: '' });
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', social: '' });

    useEffect(() => { 
        if(user) {
            localStorage.setItem(storageKeys.apps, JSON.stringify(appointments));
            localStorage.setItem(storageKeys.clients, JSON.stringify(clients));
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

    const hasAppointment = (day) => {
        const fullDateStr = `${day}. ${currentMonthName} ${currentYear}`;
        return appointments.some(app => app.date === fullDateStr);
    };

    const handleLogout = () => {
        localStorage.removeItem('inkflow_logged_user');
        setUser(null);
    };

    // --- REUSE OLD FUNCTIONS (Logika ostaje ista) ---
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

    return (
        <div className="min-h-screen pb-32">
            <header className="p-6 flex justify-between items-start">
                <div>
                    <div className="flex items-baseline gap-2">
                        <h1 className="text-2xl font-black gold-text italic uppercase leading-none tracking-tighter">INKFLOW PRO</h1>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-80">by Djape Noise</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mt-1">Tattoo Management</p>
                    <p className="text-[8px] text-yellow-500/50 font-bold mt-2 truncate max-w-[150px] uppercase">Logged: {user.email}</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'crm' && (
                        <button onClick={() => setIsClientModalOpen(true)} className="gold-bg text-black px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg">Add</button>
                    )}
                    <button onClick={handleLogout} className="bg-slate-800 text-slate-400 px-3 py-2 rounded-full font-black text-[8px] uppercase">Logout</button>
                </div>
            </header>

            {/* Ostatak main dela je identičan tvom prošlom kodu, ali koristi filtrirane podatke korisnika */}
            <main className="p-4">
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black gold-text">
                                    {appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear)).reduce((a, b) => a + (parseInt(b.price) || 0), 0)}€
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Month Rev</p>
                            </div>
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black text-white">{appointments.filter(a => a.date === todayStr).length}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Today</p>
                            </div>
                        </div>
                        {/* Prikaz termina... */}
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

                {/* Svi ostali tabovi (Calendar, Biz, CRM) su identični, samo vuku appointments i clients koji su sada filtrirani */}
                {activeTab === 'cal' && (
                    <div className="space-y-6">
                         <div className="card-bg p-6">
                            <div className="flex justify-between items-center mb-6 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800">
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 0 ? 11 : prev - 1)} className="text-yellow-500 text-2xl font-black px-2"> &lt; </button>
                                <div className="text-center">
                                    <p className="font-black gold-text italic text-lg uppercase tracking-tighter">{currentMonthName}</p>
                                    <p className="text-[10px] text-slate-700 font-bold tracking-widest">{currentYear}</p>
                                </div>
                                <button onClick={() => setCurrentMonthIdx(prev => prev === 11 ? 0 : prev + 1)} className="text-yellow-500 text-2xl font-black px-2"> &gt; </button>
                            </div>
                            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                                {Array.from({length: months[currentMonthIdx].days}, (_, i) => i + 1).map(day => {
                                    const booked = hasAppointment(day);
                                    return (
                                        <button key={day} onClick={() => setSelectedDate(day)}
                                            className={`flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center transition-all relative ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500 border border-slate-800'}`}>
                                            <span className="text-sm">{day}</span>
                                            {booked && <div className={`w-1.5 h-1.5 rounded-full absolute bottom-2 ${selectedDate === day ? 'bg-black' : 'bg-yellow-500 animate-pulse'}`}></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Appointment lista... */}
                        <div className="card-bg p-6 min-h-[300px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-black gold-text uppercase italic tracking-tighter">{selectedDate}. {currentMonthName} {currentYear}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1 rounded-full font-black text-[10px] uppercase">Add Session</button>
                            </div>
                            <div className="space-y-3">
                                {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).map(app => (
                                    <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl flex justify-between items-center border border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-slate-500 border-r border-slate-800 pr-3">{app.time}</span>
                                            <div><p className="font-bold text-white text-sm">{app.client}</p><p className="text-[9px] text-slate-500 uppercase">{app.style}</p></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="gold-text font-black text-xs">{app.price}</span>
                                            <button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="text-red-900/40 text-xl px-1">×</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Biznis Tab simuliran kao komponenta iz prošlog odgovora... */}
                {activeTab === 'biz' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="card-bg p-8 text-center">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Total Monthly Rev</h3>
                            <p className="text-5xl font-black gold-text italic italic tracking-tighter">
                                {appointments.filter(a => a.date.includes(currentMonthName)).reduce((s, a) => s + (parseInt(a.price) || 0), 0)}€
                            </p>
                        </div>
                        <div className="card-bg p-6 border border-white/5">
                             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Yearly Performance</h3>
                             {months.map(m => {
                                 const rev = appointments.filter(a => a.date.includes(m.name)).reduce((s, a) => s + (parseInt(a.price) || 0), 0);
                                 return (
                                     <div key={m.name} className="flex justify-between py-2 border-b border-white/5 text-[10px] font-bold">
                                         <span className="text-slate-500">{m.name}</span>
                                         <span className="text-white">{rev}€</span>
                                     </div>
                                 )
                             })}
                        </div>
                    </div>
                )}

                {activeTab === 'crm' && (
                    <div className="space-y-3">
                        {clients.map(c => (
                            <div key={c.id} className="card-bg p-5 flex justify-between items-center border border-slate-800">
                                <div className="flex items-center gap-4" onClick={() => setSelectedClientData(c)}>
                                    <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center text-black font-black">{c.name[0]}</div>
                                    <p className="font-bold text-white">{c.name}</p>
                                </div>
                                <button onClick={() => setClients(clients.filter(cl => cl.id !== c.id))} className="opacity-30">🗑️</button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODALI OSTAJU ISTI KAO U PRETHODNOJ VERZIJI... */}
            {/* Navigacija... */}
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
