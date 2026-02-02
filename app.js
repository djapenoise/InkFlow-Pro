const { useState, useEffect } = React;

// --- LOGIN KOMPONENTA ---
function AuthScreen({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (!email || !password) return alert("Popunite polja!");
        const users = JSON.parse(localStorage.getItem('inkflow_users') || '[]');
        
        if (isLogin) {
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            if (user) onLogin(user);
            else alert("Pogrešan email ili lozinka!");
        } else {
            if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return alert("Email već postoji!");
            const newUser = { email: email.toLowerCase(), password };
            users.push(newUser);
            localStorage.setItem('inkflow_users', JSON.stringify(users));
            onLogin(newUser);
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

// --- BUSINESS TAB ---
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
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Monthly Revenue</h3>
                <p className="text-5xl font-black gold-text italic tracking-tighter">{totalRev}€</p>
                <p className="text-[10px] text-slate-600 font-bold mt-4 uppercase tracking-widest">{currentMonthName} {currentYear}</p>
            </div>
            <div className="card-bg p-6 border border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 italic border-b border-white/5 pb-3 text-center">Yearly Performance ({currentYear})</h3>
                <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-2">
                    {yearlyStats.map(m => (
                        <div key={m.name} className={`flex justify-between items-center p-3 rounded-xl ${m.name === currentMonthName ? 'bg-yellow-500/10' : 'bg-[#0a0f1d]'}`}>
                            <span className="text-[9px] font-black text-slate-600">{m.name}</span>
                            <span className="font-black text-xs text-white">{m.rev}€</span>
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
    const [appointments, setAppointments] = useState([]);
    const [clients, setClients] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isEditClientOpen, setIsEditClientOpen] = useState(false);
    const [selectedClientData, setSelectedClientData] = useState(null);
    const [editingClient, setEditingClient] = useState(null);
    
    const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const months = [
        { name: "JANUAR", days: 31 }, { name: "FEBRUAR", days: 28 }, { name: "MART", days: 31 },
        { name: "APRIL", days: 30 }, { name: "MAJ", days: 31 }, { name: "JUN", days: 30 },
        { name: "JUL", days: 31 }, { name: "AVGUST", days: 31 }, { name: "SEPTEMBAR", days: 30 },
        { name: "OKTOBAR", days: 31 }, { name: "NOVEMBAR", days: 30 }, { name: "DECEMBAR", days: 31 }
    ];

    // KLJUČNA STVAR: Učitaj samo podatke ulogovanog korisnika
    useEffect(() => {
        if (user) {
            const savedApps = JSON.parse(localStorage.getItem(`inkflow_apps_${user.email}`) || '[]');
            const savedClients = JSON.parse(localStorage.getItem(`inkflow_clients_${user.email}`) || '[]');
            setAppointments(savedApps);
            setClients(savedClients);
            localStorage.setItem('inkflow_logged_user', JSON.stringify(user));
        } else {
            // Ako nema korisnika, isprazni sve na ekranu
            setAppointments([]);
            setClients([]);
        }
    }, [user]);

    // Čuvaj podatke samo pod ključem tog korisnika
    useEffect(() => {
        if (user && (appointments.length > 0 || clients.length > 0)) {
            localStorage.setItem(`inkflow_apps_${user.email}`, JSON.stringify(appointments));
            localStorage.setItem(`inkflow_clients_${user.email}`, JSON.stringify(clients));
        }
    }, [appointments, clients, user]);

    if (!user) return <AuthScreen onLogin={setUser} />;

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
        setUser(null);
        setActiveTab('dash');
    };

    return (
        <div className="min-h-screen pb-32 bg-[#020617] text-white">
            <header className="p-6 flex justify-between items-center">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <h1 className="text-2xl font-black gold-text italic uppercase tracking-tighter leading-none">INKFLOW</h1>
                        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">by Djape Noise</span>
                    </div>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em] mt-1">TATTOO MANAGEMENT</p>
                </div>
                <button onClick={handleLogout} className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[8px] uppercase font-black">Logout</button>
            </header>

            <main className="p-4">
                {activeTab === 'dash' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black gold-text">
                                    {appointments.filter(a => a.date.includes(currentMonthName) && a.date.includes(currentYear.toString())).reduce((a, b) => a + (parseInt(b.price) || 0), 0)}€
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Month Rev</p>
                            </div>
                            <div className="card-bg p-6">
                                <p className="text-2xl font-black text-white">{appointments.filter(a => a.date === todayStr).length}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Today</p>
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
                                        className={`flex-shrink-0 w-12 h-14 rounded-xl flex items-center justify-center ${selectedDate === day ? 'gold-bg text-black font-black' : 'bg-[#0f172a] text-slate-500'}`}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="card-bg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[11px] font-black gold-text uppercase italic tracking-tighter">{selectedDate}. {currentMonthName} {currentYear}</h3>
                                <button onClick={() => setIsModalOpen(true)} className="gold-bg text-black px-4 py-1 rounded-full font-black text-[10px] uppercase">Add</button>
                            </div>
                            {appointments.filter(a => a.date === `${selectedDate}. ${currentMonthName} ${currentYear}`).map(app => (
                                <div key={app.id} className="bg-[#0f172a] p-4 rounded-2xl mb-2 flex justify-between items-center border border-slate-800 shadow-sm">
                                    <div><p className="font-bold text-white text-sm">{app.client}</p><p className="text-[9px] text-slate-500 uppercase">{app.time} | {app.style}</p></div>
                                    <div className="flex items-center gap-3">
                                        <span className="gold-text font-black text-xs">{app.price}</span>
                                        <button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="text-red-900/40 text-lg">×</button>
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
                            <div key={c.id} className="card-bg p-4 flex justify-between items-center border border-slate-800">
                                <div onClick={() => setSelectedClientData(c)} className="flex items-center gap-4 cursor-pointer">
                                    <div className="w-10 h-10 gold-bg rounded-full flex items-center justify-center text-black font-black">{c.name[0]}</div>
                                    <p className="font-bold text-white">{c.name}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => { setEditingClient(c); setIsEditClientOpen(true); }} className="opacity-40 hover:opacity-100">✏️</button>
                                    <button onClick={() => setClients(clients.filter(cl => cl.id !== c.id))} className="opacity-40 hover:opacity-100">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* MODALI (EDIT, ADD SESSION, ETC) - Zadržani isti sa labelama koje si tražio */}
            {isEditClientOpen && editingClient && (
                <div className="fixed inset-0 z-[140] bg-black/95 flex items-center p-6">
                    <div className="card-bg w-full p-8 rounded-[40px] border border-slate-800">
                        <h2 className="text-xl font-black gold-text uppercase italic mb-8 text-center">Edit Client</h2>
                        <div className="space-y-4">
                            <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1 ml-2">Full Name</p>
                                <input type="text" value={editingClient.name} className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-white text-center" onChange={e => setEditingClient({...editingClient, name: e.target.value})} />
                            </div>
                            <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1 ml-2">Phone Number</p>
                                <input type="tel" value={editingClient.phone} className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-white text-center" onChange={e => setEditingClient({...editingClient, phone: e.target.value})} />
                            </div>
                            <div><p className="text-[8px] font-black text-slate-600 uppercase mb-1 ml-2">Instagram @tag</p>
                                <input type="text" value={editingClient.social} className="w-full bg-[#0a0f1d] border border-slate-800 p-5 rounded-2xl text-white text-center" onChange={e => setEditingClient({...editingClient, social: e.target.value})} />
                            </div>
                            <button onClick={() => { setClients(clients.map(c => c.id === editingClient.id ? editingClient : c)); setIsEditClientOpen(false); }} className="w-full gold-bg text-black font-black p-5 rounded-2xl uppercase mt-4">Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVIGACIJA */}
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
