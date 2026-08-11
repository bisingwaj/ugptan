import { testDbConnection } from "../../../actions/test-db";

export default async function TestDbPage() {
  const result = await testDbConnection();

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Neon DB Connection Test</h1>
      
      {result.success ? (
        <div style={{ padding: '20px', background: '#e6fffa', border: '1px solid #38b2ac', borderRadius: '8px' }}>
          <h2 style={{ color: '#2c7a7b', marginBottom: '10px' }}>✅ Success</h2>
          <p>{result.message}</p>
          
          <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Recent Records:</h3>
          <pre style={{ background: '#2d3748', color: '#edf2f7', padding: '15px', borderRadius: '6px', overflowX: 'auto' }}>
            {JSON.stringify(result.records, null, 2)}
          </pre>
        </div>
      ) : (
        <div style={{ padding: '20px', background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '8px' }}>
          <h2 style={{ color: '#c53030', marginBottom: '10px' }}>❌ Connection Failed</h2>
          <p style={{ color: '#9b2c2c' }}>{result.message}</p>
        </div>
      )}
    </div>
  );
}
