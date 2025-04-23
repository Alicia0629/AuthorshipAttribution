function App() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5173/login';
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Authorship Attribution</h1>
      <button onClick={handleLogin}>
        Login con Google
      </button>
    </div>
  );
}

export default App;
