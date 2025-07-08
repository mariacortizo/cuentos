import { useState, useRef, useEffect } from 'react';

function App() {
  const [texto, setTexto] = useState('');
  const [escuchando, setEscuchando] = useState(false);
  const [vozSeleccionada, setVozSeleccionada] = useState(null);
  const recognitionRef = useRef(null);

  // Función para reemplazar comandos de voz por signos
  const reemplazarComandos = (texto) => {
    const comandos = [
      { palabra: 'punto', reemplazo: '.' },
      { palabra: 'coma', reemplazo: ',' },
      { palabra: 'nueva línea', reemplazo: '\n' },
      { palabra: 'salto de línea', reemplazo: '\n' },
      { palabra: 'dos puntos', reemplazo: ':' },
      { palabra: 'punto y coma', reemplazo: ';' },
      { palabra: 'signo de exclamación', reemplazo: '!' },
      { palabra: 'signo de admiración', reemplazo: '!' },
      { palabra: 'signo de interrogación', reemplazo: '?' },
    ];

    let textoLimpio = texto.toLowerCase();

    comandos.forEach(({ palabra, reemplazo }) => {
      const regex = new RegExp(`\\b${palabra}\\b`, 'g');
      textoLimpio = textoLimpio.replace(regex, reemplazo);
    });

    return textoLimpio;
  };

  // Cargar voz "Pablo" o similar en español y leer bienvenida
  useEffect(() => {
    const cargarYLeer = () => {
      const voces = window.speechSynthesis.getVoices();

      // Buscar voz "Pablo" en español
      const vozPablo = voces.find(v => v.name.toLowerCase().includes('pablo') && v.lang.startsWith('es'));
      const vozAlternativa = voces.find(v => v.lang.startsWith('es'));
      const vozElegida = vozPablo || vozAlternativa;

      setVozSeleccionada(vozElegida);

      if (vozElegida) {
        const bienvenida = new SpeechSynthesisUtterance('Soy Pablo. Presione el botón verde para empezar a dictar su cuento.');
        bienvenida.voice = vozElegida;
        bienvenida.lang = 'es-AR';
        bienvenida.rate = 1;
        window.speechSynthesis.speak(bienvenida);

        console.log("Voz seleccionada:", vozElegida.name, vozElegida.lang);
      }
    };

    window.speechSynthesis.onvoiceschanged = cargarYLeer;
    cargarYLeer();
  }, []);

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
      let resultado = Array.from(event.results)
        .map(r => r[0].transcript)
        .join(' ');

      resultado = reemplazarComandos(resultado);

      setTexto(prev => prev + resultado + ' ');
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

    if (vozSeleccionada) {
      speech.voice = vozSeleccionada;
    }

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

      {/* Contenedor textarea y botón borrar a la derecha */}
      <div style={{ display: 'flex', flexGrow: 1, marginBottom: 20, gap: '10px' }}>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          style={{
            flexGrow: 1,
            fontSize: '1.5rem',
            padding: 15,
            backgroundColor: '#222',
            color: '#fff',
            borderRadius: 10,
            border: '2px solid #555',
            resize: 'none',
            boxSizing: 'border-box',
            height: '100%',
            minHeight: '300px',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <button
            onClick={() => setTexto('')}
            style={{
              backgroundColor: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '1.2rem',
              cursor: 'pointer',
              height: 'fit-content',
            }}
            aria-label="Borrar texto"
          >
            🗑️ Borrar
          </button>
        </div>
      </div>

      {/* Botones */}
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

// Estilos botones
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
  backgroundColor: '#28a745'
};

export default App;
