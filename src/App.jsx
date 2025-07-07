import { useState, useRef } from 'react';

function App() {
  const [texto, setTexto] = useState('');
  const [escuchando, setEscuchando] = useState(false);
  const recognitionRef = useRef(null);

  const iniciarDictado = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'es-AR';
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const resultado = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setTexto(prev => prev + resultado);
    };

    recognition.onend = () => {
      setEscuchando(false);
    };

    recognition.start();
    setEscuchando(true);
  };

  const detenerDictado = () => {
    recognitionRef.current?.stop();
    setEscuchando(false);
  };

  const imprimirTexto = () => {
    window.print();
  };

  const leerTexto = () => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = texto;
    speech.lang = 'es-AR';
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  return (
    <div
      style={{
        padding: 20,
        fontSize: '1.2rem',
        backgroundColor: '#000',
        color: '#fff',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1 style={{ fontSize: '2rem', margin: 0, marginBottom: 10 }}>Dictado de cuentos</h1>

      {/* Contenedor del textarea */}
      <div style={{ position: 'relative', flexGrow: 1, marginBottom: 20 }}>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          style={{
            width: '100%',
            height: '100%',
            fontSize: '1.5rem',
            padding: 15,
            backgroundColor: '#222',
            color: '#fff',
            borderRadius: 10,
            border: '2px solid #555',
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />
        {/* Botón borrar flotante */}
        <button
          onClick={() => setTexto('')}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          🗑️ Borrar
        </button>
      </div>

      {/* Botones finales */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {!escuchando ? (
          <button onClick={iniciarDictado} style={botonGrande}>🎙️ Empezar a dictar</button>
        ) : (
          <button onClick={detenerDictado} style={botonStyle}>⏹️ Detener dictado</button>
        )}

        <button onClick={leerTexto} style={botonGrande}>🔊 Leer cuento</button>
        <button onClick={imprimirTexto} style={botonStyle}>🖨️ Imprimir</button>
      </div>
    </div>
  );
}

const botonStyle = {
  padding: '14px 24px',
  fontSize: '1.4rem',
  backgroundColor: '#06f',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer'
};

const botonGrande = {
  ...botonStyle,
  fontSize: '1.8rem',
  backgroundColor: '#28a745' // verde accesible
};

export default App;
