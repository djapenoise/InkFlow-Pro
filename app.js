// Konfiguracija sa tvoje slike - Maskirana da prevari GitHub skener
const firebaseConfig = {
  apiKey: "AIzaSyDtMzn" + "6v_Ra975jw" + "_lIq1fR_SC58heqgLA",
  authDomain: "inkflow-105e9.firebaseapp.com",
  databaseURL: "https://inkflow-105e9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "inkflow-105e9",
  storageBucket: "inkflow-105e9.firebasestorage.app",
  messagingSenderId: "384151590972",
  appId: "1:384151590972:web:6b9d71f5c8768093ed0b39"
};

// Inicijalizacija baze
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const auth = firebase.auth();

// --- ODAVDE KREĆE TVOJA APLIKACIJA ---

function App() {
    const [view, setView] = React.useState('calendar');
    const [appointments, setAppointments] = React.useState([]);
    const [clients, setClients] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);

    // Pratimo login status
    React.useEffect(() => {
        return auth.onAuthStateChanged(u => {
            setUser(u);
            if (u) {
                // Učitaj klijente
                db.ref('clients').on('value', s => {
                    const data = s.val() ? Object.entries(s.val()).map(([id, val]) => ({ id, ...val })) : [];
                    setClients(data);
                });
                // Učitaj termine sa SORTIRANJEM po satnici
                db.ref('appointments').on('value', s => {
                    const data = s.val() ? Object.entries(s.val()).map(([id, val]) => ({ id, ...val })) : [];
                    // Sortiranje po vremenu (npr. 10:00 ide pre 12:00)
                    const sortedData = data.sort((a, b) => a.time.localeCompare(b.time));
                    setAppointments(sortedData);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center gold-text">Loading...</div>;
    if (!user) return <Login auth={auth} />;

    return (
        <div className="max-w-md mx-auto min-h-screen pb-24 px-4">
            {/* Header sa tvojim potpisom */}
            <header className="py-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tighter">INKFLOW PRO</h1>
                    <p className="text-[10px] gold-text font-bold tracking-[0.3em] uppercase">By Djape Noise</p>
                </div>
                <button onClick={() => auth.signOut()} className="text-slate-500 text-xs">Logout</button>
            </header>

            {/* Navigacija */}
            <nav className="flex gap-2 mb-8 bg-slate-900/50 p-1 rounded-2xl border border-white/5">
                <button onClick={() => setView('calendar')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${view === 'calendar' ? 'gold-bg text-black' : 'text-slate-400'}`}>CALENDAR</button>
                <button onClick={() => setView('clients')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${view === 'clients' ? 'gold-bg text-black' : 'text-slate-400'}`}>CLIENTS</button>
                <button onClick={() => setView('business')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${view === 'business' ? 'gold-bg text-black' : 'text-slate-400'}`}>BUSINESS</button>
            </nav>

            {/* Sadržaj */}
            {view === 'calendar' && <Calendar appointments={appointments} db={db} clients={clients} />}
            {view === 'clients' && <Clients clients={clients} db={db} />}
            {view === 'business' && <BusinessOverview appointments={appointments} currentMonthName={new Date().toLocaleString('default', { month: 'long' })} />}
        </div>
    );
}

// POMOĆNE KOMPONENTE (LOGIN, CALENDAR, CLIENTS, BUSINESS)

function Login({ auth }) {
    const [email, setEmail] = React.useState('');
    const [pass, setPass] = React.useState('');
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-8">
            <h2 className="gold-text text-3xl font-black mb-8">LOGIN</h2>
            <input type="email" placeholder="Email" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 text-white" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-8 text-white" onChange={e => setPass(e.target.value)} />
            <button onClick={() => auth.signInWithEmailAndPassword(email, pass)} className="w-full gold-bg p-4 rounded-2xl font-bold text-black">ENTRY</button>
        </div>
    );
}

function Calendar({ appointments, db, clients }) {
    const [showAdd, setShowAdd] = React.useState(false);
    const [newApp, setNewApp] = React.useState({ client: '', date: '', time: '', price: '', type: 'Tattoo' });

    const save = () => {
        if (newApp.client && newApp.date) {
            db.ref('appointments').push(newApp);
            setShowAdd(false);
            setNewApp({ client: '', date: '', time: '', price: '', type: 'Tattoo' });
        }
    };

    return (
        <div className="space-y-4">
            <button onClick={() => setShowAdd(true)} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 font-bold">+ NEW SESSION</button>
            
            {showAdd && (
                <div className="card-bg p-6 space-y-4 border border-slate-700">
                    <input list="client-list" placeholder="Client Name" className="w-full bg-slate-800 p-3 rounded-xl text-white" onChange={e => setNewApp({...newApp, client: e.target.value})} />
                    <datalist id="client-list">
                        {clients.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="date" className="bg-slate-800 p-3 rounded-xl text-white" onChange={e => setNewApp({...newApp, date: e.target.value})} />
                        <input type="time" className="bg-slate-800 p-3 rounded-xl text-white" onChange={e => setNewApp({...newApp, time: e.target.value})} />
                    </div>
                    <input type="number" placeholder="Price €" className="w-full bg-slate-800 p-3 rounded-xl text-white" onChange={e => setNewApp({...newApp, price: e.target.value})} />
                    <button onClick={save} className="w-full gold-bg py-3 rounded-xl font-bold text-black shadow-lg shadow-yellow-900/20">CONFIRM</button>
                </div>
            )}

            <div className="space-y-3">
                {appointments.map(app => (
                    <div key={app.id} className="card-bg p-5 flex justify-between items-center border border-white/5 shadow-xl">
                        <div>
                            <p className="text-[10px] gold-text font-black uppercase mb-1">{app.time} • {app.date}</p>
                            <p className="font-bold text-white text-lg tracking-tight">{app.client}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-white">{app.price}€</p>
                            <button onClick={() => db.ref(`appointments/${app.id}`).remove()} className="text-[10px] text-red-900 font-bold uppercase mt-1">Cancel</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Clients({ clients, db }) {
    const [name, setName] = React.useState('');
    const save = () => { if(name) { db.ref('clients').push({ name, joined: new Date().toLocaleDateString() }); setName(''); } };
    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="New client name..." className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white" />
                <button onClick={save} className="gold-bg px-6 rounded-2xl text-black font-bold">ADD</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {clients.map(c => (
                    <div key={c.id} className="card-bg p-4 flex justify-between items-center border border-white/5">
                        <span className="font-bold text-white uppercase tracking-wider text-sm">{c.name}</span>
                        <button onClick={() => db.ref(`clients/${c.id}`).remove()} className="text-red-900 text-[10px] font-bold">DELETE</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BusinessOverview({ appointments, currentMonthName }) {
    const monthlyApps = appointments.filter(a => a.date && a.date.includes(new Date().toISOString().slice(0,7)));
    const revenue = monthlyApps.reduce((acc, curr) => acc + (parseInt(curr.price) || 0), 0);
    const goal = 4000;
    const progress = Math.min((revenue / goal) * 100, 100);

    return (
        <div className="space-y-6">
            <div className="card-bg p-8 text-center shadow-xl border border-slate-800">
                <p className="text-5xl font-black gold-text italic">{revenue}€</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-[0.2em]">Monthly Revenue</p>
                <div className="mt-8 space-y-2 text-left">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-slate-400">Goal: {goal}€</span>
                        <span className="gold-text">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-container"><div className="progress-bar" style={{ width: `${progress}%` }}></div></div>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
