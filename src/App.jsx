import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';

function App() {
  const [texto, setTexto] = useState('');
  const [escuchando, setEscuchando] = useState(false);
  const [vozSeleccionada, setVozSeleccionada] = useState(null);
  const recognitionRef = useRef(null);

  const reemplazarComandos = (texto) => {
  const comandos = [
    { palabra: 'punto y aparte', reemplazo: '.\n\n' },
    { palabra: 'punto y coma', reemplazo: ';' },
    { palabra: 'punto', reemplazo: '.' },
    { palabra: 'coma', reemplazo: ',' },
    { palabra: 'nueva línea', reemplazo: '\n' },
    { palabra: 'salto de línea', reemplazo: '\n' },
    { palabra: 'dos puntos', reemplazo: ':' },
    { palabra: 'signo de exclamación', reemplazo: '!' },
    { palabra: 'signo de admiración', reemplazo: '!' },
    { palabra: 'signo de interrogación', reemplazo: '?' },
  ];

  let textoLimpio = texto.toLowerCase();

  // Reemplazar palabras por signos
  comandos.forEach(({ palabra, reemplazo }) => {
    const regex = new RegExp(`\\b${palabra}\\b`, 'g');
    textoLimpio = textoLimpio.replace(regex, reemplazo);
  });

  // Capitalizar la primera letra de cada oración
  textoLimpio = textoLimpio.replace(/(^\s*|[\.\!\?\n]\s*)([a-z])/g, (match, sep, letra) => {
    return sep + letra.toUpperCase();
  });

  return textoLimpio;
};


  useEffect(() => {
    const cargarYLeer = () => {
      const voces = window.speechSynthesis.getVoices();
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
      }
    };
    window.speechSynthesis.onvoiceschanged = cargarYLeer;
    cargarYLeer();
  }, []);

  const iniciarDictado = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Tu navegador no soporta reconocimiento de voz');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'es-AR';
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let resultado = Array.from(event.results).map(r => r[0].transcript).join(' ');
      resultado = reemplazarComandos(resultado);
      setTexto(prev => prev + resultado + ' ');
    };

    recognition.onend = () => setEscuchando(false);
    recognition.start();
    setEscuchando(true);
  };

  const detenerDictado = () => {
    recognitionRef.current?.stop();
    setEscuchando(false);
  };

  const imprimirTexto = () => window.print();

  const guardarComoPDF = () => {
    const doc = new jsPDF();
    const lineas = doc.splitTextToSize(texto, 180);
    doc.text(lineas, 10, 10);
    doc.save("cuento.pdf");
  };

  const guardarComoWord = async () => {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: texto.split('\n').map(line => new TextRun({ text: line, break: 1 }))
          }),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "cuento.docx");
  };

  const leerTexto = () => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = texto;
    speech.lang = 'es-AR';
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    if (vozSeleccionada) speech.voice = vozSeleccionada;
    window.speechSynthesis.speak(speech);
  };

  return (
    <div style={{
      padding: 10,
      backgroundColor: '#000',
      color: '#fff',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 5 }}>📝 Dictado de cuentos</h1>

      <div style={{
        display: 'flex',
        flexGrow: 1,
        gap: '10px',
        overflow: 'hidden',
      }}>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          style={{
            flexGrow: 1,
            fontSize: '1.2rem',
            padding: 12,
            backgroundColor: '#222',
            color: '#fff',
            borderRadius: 8,
            border: '1px solid #555',
            resize: 'none',
            height: '100%',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'space-between' }}>
          <button onClick={() => setTexto('')} style={botonRojo}>🗑️ Borrar</button>
          <button onClick={imprimirTexto} style={botonStyle}>🖨️ Imprimir</button>
          <button onClick={guardarComoPDF} style={botonStyle}>📄 Guardar PDF</button>
          <button onClick={guardarComoWord} style={botonStyle}>📝 Guardar Word</button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: '10px',
      }}>
        {!escuchando ? (
          <button onClick={iniciarDictado} style={botonGrande}>🎙️ Empezar a dictar</button>
        ) : (
          <button onClick={detenerDictado} style={botonStyle}>⏹️ Detener dictado</button>
        )}
        <button onClick={leerTexto} style={botonGrande}>🔊 Leer cuento</button>
      </div>
    </div>
  );
}

const botonStyle = {
  padding: '12px 20px',
  fontSize: '1.2rem',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
};

const botonGrande = {
  ...botonStyle,
  fontSize: '1.6rem',
  backgroundColor: '#28a745'
};

const botonRojo = {
  ...botonStyle,
  backgroundColor: '#dc3545'
};

export default App;