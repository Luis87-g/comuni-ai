import React, { useEffect, useMemo, useState } from 'react';

const phraseBank = [
  { text: 'Quiero ir a la universidad.', icon: '🎓', category: 'Estudio' },
  { text: 'Quiero ir a casa.', icon: '🏠', category: 'Lugares' },
  { text: 'Necesito ayuda, por favor.', icon: '🤝', category: 'Necesidades' },
  { text: 'Tengo hambre.', icon: '🍽️', category: 'Necesidades' },
  { text: 'Tengo sed.', icon: '🥤', category: 'Necesidades' },
  { text: 'Me siento bien.', icon: '😊', category: 'Emociones' },
  { text: 'Me siento mal.', icon: '😟', category: 'Emociones' },
  { text: 'Quiero hablar contigo.', icon: '💬', category: 'Social' },
  { text: 'Quiero descansar.', icon: '🛏️', category: 'Necesidades' },
  { text: 'Gracias.', icon: '❤️', category: 'Social' },
  { text: 'Quiero ir al médico.', icon: '🏥', category: 'Lugares' },
  { text: 'Quiero salir.', icon: '🚶', category: 'Lugares' }
];

const pictos = [
  ['🏠','Casa'], ['🎓','Universidad'], ['🏥','Médico'], ['🍽','Comida'],
  ['🥤','Agua'], ['👨‍👩‍👧','Familia'], ['👋','Hola'], ['❤️','Amor'],
  ['😊','Feliz'], ['😟','Triste'], ['🚌','Transporte'], ['🤝','Ayuda']
];

export default function App() {
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('comuni_users_db') || '{}'));
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('comuni_active_user') || null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const [page, setPage] = useState('Inicio');
  const [message, setMessage] = useState('');
  const [fontScale, setFontScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [translated, setTranslated] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [translating, setTranslating] = useState(false);
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (currentUser && users[currentUser]) {
      setHistory(users[currentUser].history || []);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('comuni_users_db', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('comuni_active_user', currentUser);
    } else {
      localStorage.removeItem('comuni_active_user');
    }
  }, [currentUser]);

  function handleAuth(e) {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail || !passwordInput) {
      return setNotice('Por favor completa todos los campos.');
    }

    if (isRegistering) {
      if (!nameInput.trim()) return setNotice('Por favor ingresa tu nombre.');
      if (users[cleanEmail]) return setNotice('Este correo ya está registrado.');

      const newUser = {
        name: nameInput.trim(),
        email: cleanEmail,
        password: passwordInput,
        history: []
      };

      setUsers(prev => ({ ...prev, [cleanEmail]: newUser }));
      setCurrentUser(cleanEmail);
      setNotice(`¡Bienvenido a COMUNI-AI, ${newUser.name}!`);
    } else {
      const user = users[cleanEmail];
      if (!user || user.password !== passwordInput) {
        return setNotice('Correo o contraseña incorrectos.');
      }

      setCurrentUser(cleanEmail);
      setNotice(`¡Hola de nuevo, ${user.name}!`);
    }

    setEmailInput('');
    setPasswordInput('');
    setNameInput('');
  }

  function handleLogout() {
    setCurrentUser(null);
    setMessage('');
    setPage('Inicio');
    setNotice('Has cerrado sesión correctamente.');
  }

  function sendMessage() {
    if (!message.trim()) return setNotice('Construye un mensaje antes de enviarlo.');
    if (!currentUser) return;

    const newHistory = [message.trim(), ...history].slice(0, 100);
    setHistory(newHistory);

    setUsers(prev => ({
      ...prev,
      [currentUser]: {
        ...prev[currentUser],
        history: newHistory
      }
    }));

    setNotice('Mensaje guardado en tu historial personal.');
  }

  const suggestions = useMemo(() => {
    const counts = history.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
    return [...phraseBank].sort((a,b) => (counts[b.text] || 0) - (counts[a.text] || 0)).slice(0,4);
  }, [history]);

  function addToMessage(value) {
    setMessage(prev => prev ? `${prev.trim()} ${value}` : value);
    setPage('Comunicador');
  }

  function selectPhrase(text) {
    setMessage(text);
    setNotice('Frase añadida al mensaje.');
  }

  function speak(text = message) {
    if (!text.trim()) return setNotice('Primero escribe o construye un mensaje.');
    if (!('speechSynthesis' in window)) return setNotice('Este navegador no soporta función de voz.');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-CO';
    window.speechSynthesis.speak(utterance);
    setNotice('Reproduciendo mensaje…');
  }

  async function translate() {
    if (!message.trim()) return setNotice('Escribe un mensaje antes de traducirlo.');
    setTranslating(true); setTranslated('');
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(message)}&langpair=es|${targetLang}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('No se pudo conectar.');
      const data = await response.json();
      setTranslated(data.responseData?.translatedText || 'No se obtuvo respuesta.');
    } catch {
      setNotice('No fue posible traducir. Inténtalo de nuevo.');
    } finally { setTranslating(false); }
  }

  const activeUserData = currentUser ? users[currentUser] : null;

  // --- INTERFAZ DE INICIO DE SESIÓN CON ANIMACIONES Y HOVER ---
  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Segoe UI', Roboto, -apple-system, sans-serif",
        background: '#090d16',
        color: '#fff',
        overflow: 'hidden'
      }}>
        {/* ESTILOS CSS INLINE PARA EFECTOS DE "ENCOGIMIENTO" Y SEÑALIZACIÓN */}
        <style>{`
          .interactive-btn {
            transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s ease, background-color 0.2s ease, border-color 0.2s ease !important;
            cursor: pointer !important;
          }
          .interactive-btn:hover {
            transform: translateY(-2px) scale(1.02) !important;
            box-shadow: 0 8px 20px rgba(13, 148, 136, 0.4) !important;
          }
          .interactive-btn:active {
            transform: translateY(1px) scale(0.97) !important;
          }

          .tab-btn {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer !important;
          }
          .tab-btn:hover {
            opacity: 0.9 !important;
            transform: scale(1.02) !important;
          }
          .tab-btn:active {
            transform: scale(0.96) !important;
          }

          .input-focus {
            transition: all 0.2s ease !important;
          }
          .input-focus:hover {
            border-color: #0d9488 !important;
            background: #1c2a42 !important;
          }
          .input-focus:focus {
            border-color: #14b8a6 !important;
            box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.25) !important;
            background: #1c2a42 !important;
          }

          .feature-card {
            transition: all 0.25s ease !important;
          }
          .feature-card:hover {
            transform: translateY(-3px) scale(1.03) !important;
            background: rgba(255, 255, 255, 0.18) !important;
            border-color: rgba(255, 255, 255, 0.35) !important;
          }
        `}</style>

        {/* SECCIÓN IZQUIERDA: PRESENTACIÓN DEL PROYECTO */}
        <div style={{
          flex: '1.2',
          background: 'radial-gradient(circle at 20% 20%, #14b8a6 0%, #0d9488 40%, #042f2e 100%)',
          padding: '50px 60px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          position: 'relative',
          boxSizing: 'border-box'
        }}>
          {/* Esferas decorativas de luz */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '-50px', width: '350px', height: '350px', background: 'rgba(0,0,0,0.25)', borderRadius: '50%', filter: 'blur(40px)' }} />

          {/* Header del proyecto (SE QUITÓ EL v2.0) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.25)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', backdropFilter: 'blur(10px)', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                💬
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '1px' }}>COMUNI-AI</h3>
                <span style={{ fontSize: '11px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Plataforma AAC Adaptativa</span>
              </div>
            </div>
          </div>

          {/* Mensaje central impactante */}
          <div style={{ zIndex: 2, margin: '40px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '600', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span>🚀</span> Proyecto Innovador de Accesibilidad
            </div>
            <h1 style={{ fontSize: '46px', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              Comunicación sin límites para todos.
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.95, lineHeight: '1.6', maxWidth: '520px' }}>
              Diseñado desde cero para romper barreras de voz y lenguaje mediante síntesis de audio, pictogramas dinámicos y traducción inteligente.
            </p>

            {/* Módulos interactivos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '32px' }}>
              <div className="feature-card" style={{ background: 'rgba(255,255,255,0.12)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'default' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔊</div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>Voz & Audio</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>Lectura instantánea de mensajes</div>
              </div>
              <div className="feature-card" style={{ background: 'rgba(255,255,255,0.12)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'default' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧩</div>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>Pictogramas</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>Selección visual rápida</div>
              </div>
            </div>
          </div>

          {/* Sello del equipo */}
          <div style={{ zIndex: 2, background: 'rgba(0,0,0,0.2)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', opacity: 0.85, letterSpacing: '1px' }}>Desarrollado con dedicación por</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: '700' }}>Equipo de Proyecto COMUNI-AI</p>
            </div>
            <div style={{ fontSize: '20px' }}>⚡</div>
          </div>
        </div>

        {/* SECCIÓN DERECHA: FORMULARIO INTERACTIVO */}
        <div style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          padding: '40px',
          background: '#0b1120',
          position: 'relative'
        }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            
            {/* TABS DE SELECCIÓN CON ANIMACIÓN */}
            <div style={{
              display: 'flex',
              background: '#162032',
              padding: '5px',
              borderRadius: '14px',
              marginBottom: '32px',
              border: '1px solid #1e2d4a'
            }}>
              <button 
                type="button"
                className="tab-btn"
                onClick={() => { setIsRegistering(false); setNotice(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: !isRegistering ? '#0d9488' : 'transparent',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: !isRegistering ? '0 4px 12px rgba(13, 148, 136, 0.4)' : 'none'
                }}
              >
                Iniciar Sesión
              </button>
              <button 
                type="button"
                className="tab-btn"
                onClick={() => { setIsRegistering(true); setNotice(''); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isRegistering ? '#0d9488' : 'transparent',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: isRegistering ? '0 4px 12px rgba(13, 148, 136, 0.4)' : 'none'
                }}
              >
                Crear Cuenta
              </button>
            </div>

            {/* ENCABEZADO DEL FORMULARIO */}
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: '#f8fafc', letterSpacing: '-0.5px' }}>
                {isRegistering ? 'Crear nueva cuenta' : 'Bienvenido de nuevo'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                {isRegistering ? 'Regístrate para guardar tu historial y personalizar tu comunicador.' : 'Ingresa tus datos para acceder a tu espacio personal.'}
              </p>
            </div>

            {/* FORMULARIO */}
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isRegistering && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                    Nombre de usuario
                  </label>
                  <input 
                    type="text" 
                    className="input-focus"
                    placeholder="Tu nombre completo" 
                    value={nameInput} 
                    onChange={e => setNameInput(e.target.value)} 
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: '#162032',
                      border: '1px solid #24344d',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                  Correo electrónico
                </label>
                <input 
                  type="email" 
                  className="input-focus"
                  placeholder="usuario@correo.com" 
                  value={emailInput} 
                  onChange={e => setEmailInput(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#162032',
                    border: '1px solid #24344d',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                  Contraseña
                </label>
                <input 
                  type="password" 
                  className="input-focus"
                  placeholder="••••••••" 
                  value={passwordInput} 
                  onChange={e => setPasswordInput(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#162032',
                    border: '1px solid #24344d',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }} 
                />
              </div>

              <button 
                type="submit" 
                className="interactive-btn"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '700',
                  marginTop: '10px',
                  boxShadow: '0 6px 20px rgba(13, 148, 136, 0.35)'
                }}
              >
                {isRegistering ? 'Completar Registro →' : 'Ingresar a COMUNI-AI →'}
              </button>
            </form>

            {notice && (
              <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#fca5a5',
                fontSize: '13px',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {notice}
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }

  // --- INTERFAZ PRINCIPAL DE LA APP ---
  return <div className={highContrast ? 'app high-contrast' : 'app'} style={{'--font-scale': fontScale}}>
    <header className="topbar">
      <div className="brand-mark">💬</div>
      <div><div className="brand">COMUNI-AI</div><small>Tu voz, nuestra tecnología</small></div>
      <div className="top-spacer" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="profile-pill">👤 {activeUserData?.name}</span>
        <button className="secondary" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '13px' }}>Cerrar Sesión</button>
      </div>
    </header>

    <div className="layout">
      <aside className="sidebar">
        {['Inicio','Comunicador','Pictogramas','Frases','Traducción','Historial','Accesibilidad'].map((item, i) =>
          <button key={item} className={page===item?'nav active':'nav'} onClick={()=>{setPage(item);setNotice('')}}>
            <span>{['⌂','✍️','🧩','💬','🌐','🕘','⚙️'][i]}</span>{item}
          </button>
        )}
        <div className="side-note">Sesión activa como: <b>{activeUserData?.name}</b></div>
      </aside>

      <main className="content">
        {page === 'Inicio' && <section className="welcome">
          <div className="welcome-copy">
            <span className="eyebrow">BIENVENIDO A COMUNI-AI</span>
            <h1>¡Hola, {activeUserData?.name}!</h1>
            <p>Construye mensajes con pictogramas, palabras o frases. Todo tu historial se guarda automáticamente en tu cuenta.</p>
            <div className="actions">
              <button className="primary" onClick={()=>setPage('Comunicador')}>Crear un mensaje →</button>
              <button className="secondary" onClick={()=>setPage('Accesibilidad')}>Personalizar accesibilidad</button>
            </div>
          </div>
          <div className="welcome-art"><div className="big-bubble">💬</div><div className="art-caption">Tu mensaje, a tu manera</div></div>
        </section>}

        {page === 'Comunicador' && <section>
          <div className="section-heading"><div><span className="eyebrow">ESPACIO DE COMUNICACIÓN</span><h1>Construye tu mensaje</h1></div><button className="secondary" onClick={()=>setMessage('')}>Limpiar</button></div>
          <div className="message-card"><label htmlFor="message">Tu mensaje ({activeUserData?.name})</label><textarea id="message" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Escribe aquí o agrega pictogramas y frases…" /><div className="message-actions"><button className="secondary" onClick={()=>setPage('Pictogramas')}>＋ Pictogramas</button><button className="secondary" onClick={()=>setPage('Frases')}>＋ Frases</button><button className="primary" onClick={sendMessage}>Guardar mensaje</button><button className="voice" onClick={()=>speak()}>🔊 Escuchar</button></div></div>
          <h2 className="subheading">Sugerencias para ti</h2><div className="suggestion-grid">{suggestions.map(s=><button className="suggestion" key={s.text} onClick={()=>selectPhrase(s.text)}><span>{s.icon}</span><span>{s.text}</span><b>＋</b></button>)}</div>
        </section>}

        {page === 'Pictogramas' && <section><span className="eyebrow">COMUNICACIÓN VISUAL</span><h1>Selecciona pictogramas</h1><p className="muted">Elige elementos para agregarlos a tu mensaje.</p><div className="picto-grid">{pictos.map(([icon,label])=><button className="picto" key={label} onClick={()=>addToMessage(`${icon} ${label}`)}><span>{icon}</span><b>{label}</b></button>)}</div></section>}

        {page === 'Frases' && <section><span className="eyebrow">MENSAJES LISTOS PARA USAR</span><h1>Frases predefinidas</h1><div className="filter-row">{['Todas','Necesidades','Emociones','Lugares','Social','Estudio'].map(x=><span className="filter-chip" key={x}>{x}</span>)}</div><div className="phrase-list">{phraseBank.map(p=><button className="phrase" key={p.text} onClick={()=>selectPhrase(p.text)}><span>{p.icon}</span><span><b>{p.text}</b><small>{p.category}</small></span><strong>＋</strong></button>)}</div></section>}

        {page === 'Traducción' && <section><span className="eyebrow">COMUNICACIÓN EN OTROS IDIOMAS</span><h1>Traduce tu mensaje</h1><div className="translator"><div className="language-row"><b>Español</b><span>⇄</span><select value={targetLang} onChange={e=>setTargetLang(e.target.value)}><option value="en">Inglés</option><option value="fr">Francés</option><option value="pt">Portugués</option></select></div><label>Mensaje original</label><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Escribe el mensaje que deseas traducir…" /><button className="primary" onClick={translate} disabled={translating}>{translating?'Traduciendo…':'Traducir mensaje'}</button>{translated && <div className="translation-result"><label>Traducción</label><p>{translated}</p><button className="voice" onClick={()=>speak(translated)}>🔊 Escuchar traducción</button></div>}</div></section>}

        {page === 'Historial' && <section><span className="eyebrow">HISTORIAL PERSONAL DE {activeUserData?.name.toUpperCase()}</span><h1>Tus mensajes guardados</h1>{history.length ? <div className="phrase-list">{history.map((h,i)=><button className="phrase" key={`${h}-${i}`} onClick={()=>{setMessage(h);setPage('Comunicador')}}><span>🕘</span><b>{h}</b><strong>↗</strong></button>)}</div>:<p className="muted">No tienes mensajes guardados aún en tu cuenta.</p>}</section>}

        {page === 'Accesibilidad' && <section><span className="eyebrow">PERSONALIZA TU EXPERIENCIA</span><h1>Accesibilidad</h1><div className="settings-card"><div className="setting"><div><b>Tamaño del texto</b><small>Adapta el tamaño para facilitar la lectura.</small></div><div className="setting-controls"><button onClick={()=>setFontScale(v=>Math.max(.9,v-.1))}>A−</button><button onClick={()=>setFontScale(1)}>A</button><button onClick={()=>setFontScale(v=>Math.min(1.3,v+.1))}>A+</button></div></div><div className="setting"><div><b>Alto contraste</b><small>Resalta los elementos de la interfaz.</small></div><input type="checkbox" checked={highContrast} onChange={e=>setHighContrast(e.target.checked)} /></div></div></section>}

        {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
      </main>
    </div>
    <footer>COMUNI-AI · Sistema de usuarios y accesibilidad</footer>
  </div>;
}