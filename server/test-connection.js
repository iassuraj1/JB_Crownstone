// DNS + connectivity test for MongoDB Atlas
// Explicitly uses Google DNS (8.8.8.8) so ISP DNS issues don't matter
const dns = require('dns');
const net = require('net');

// Override DNS servers to Google/Cloudflare BEFORE any other operation
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

console.log('🔍 Testing DNS resolution via Google DNS (8.8.8.8)...');

dns.resolveSrv('_mongodb._tcp.cluster0.xvkhdo4.mongodb.net', (err, records) => {
  if (err) {
    console.error('❌ SRV DNS lookup FAILED:', err.message);
    console.log('\n💡 This means even Google DNS cannot resolve the Atlas cluster.');
    console.log('   Check your Atlas cluster name is correct.');
    process.exit(1);
  }

  console.log('✅ DNS resolved! Found', records.length, 'shard(s):');
  records.forEach(r => console.log(`   → ${r.name}:${r.port}`));

  // Test TCP connection to first shard
  const host = records[0].name;
  const port = records[0].port;

  console.log(`\n🔌 Testing TCP connection to ${host}:${port}...`);

  const socket = net.createConnection({ host, port, timeout: 5000 });

  socket.on('connect', () => {
    console.log('✅ TCP connection SUCCESSFUL! Port 27017 is open.');
    console.log('\n🚀 Everything looks good — run: npm run seed');
    socket.destroy();
    process.exit(0);
  });

  socket.on('timeout', () => {
    console.error('❌ TCP connection TIMED OUT — port 27017 is BLOCKED on your network');
    console.log('\n🔧 Fix: Connect to mobile hotspot and try again.');
    console.log('   OR: Ask your ISP/router to unblock port 27017.');
    socket.destroy();
    process.exit(1);
  });

  socket.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.error('❌ Connection REFUSED on port 27017');
    } else {
      console.error('❌ TCP error:', err.message);
    }
    process.exit(1);
  });
});
