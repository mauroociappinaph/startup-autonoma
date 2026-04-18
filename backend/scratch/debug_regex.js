const stdout = '[main abc1234] feat: test commit\n 1 file changed, 1 insertion(+)\n';
const patterns = [
  /\[\w+\s+([a-f0-9]{7,40})\]/, // [branch abc1234]
  /\s([a-f0-9]{7,40})\]/,       //  abc1234]
  /([a-f0-9]{7,40})/            // Cualquier hash hex de 7+ chars
];

let commitId;
for (const pattern of patterns) {
  const match = pattern.exec(stdout);
  console.log(`Testing pattern ${pattern}: ${match ? 'MATCH' : 'NO MATCH'}`);
  if (match) {
    commitId = match[1] || match[0];
    console.log(`Captured: ${commitId}`);
    break;
  }
}
console.log(`Final commitId: ${commitId}`);
