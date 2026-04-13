// Temp script to resolve Atlas SRV via Google DNS and show direct connection string
const dns = require('dns');

// Force Google DNS
const dnsPromises = dns.promises;
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

async function resolve() {
  try {
    const records = await dnsPromises.resolveSrv('_mongodb._tcp.cluster0.xvkhdo4.mongodb.net');
    console.log('\n✅ SRV Records found:');
    records.forEach(r => console.log(`  - ${r.name}:${r.port} (priority ${r.priority})`));
    
    const hosts = records.map(r => `${r.name}:${r.port}`).join(',');
    const directUri = `mongodb://shoaibahktar56_db_user:1v53rGjGXvskxStK@${hosts}/jbcrownstone?authSource=admin&replicaSet=atlas-${records[0]?.name?.split('-')[1] || 'xxx'}&tls=true&retryWrites=true&w=majority`;
    
    console.log('\n📋 Copy this into your .env as MONGO_URI:');
    console.log(directUri);
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.log('\n💡 Trying with explicit Google DNS resolver...');
    
    // Fallback: try to resolve by address
    dns.resolveSrv('_mongodb._tcp.cluster0.xvkhdo4.mongodb.net', (err, records) => {
      if (err) {
        console.error('Still failed:', err.message);
        return;
      }
      console.log('Records:', records);
    });
  }
}

resolve();
