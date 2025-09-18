// Test UUID conversion for current user
function clerkUserIdToUuid(clerkUserId) {
  let hash = 0;
  for (let i = 0; i < clerkUserId.length; i++) {
    const char = clerkUserId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
  
  let hash2 = 0;
  for (let i = clerkUserId.length - 1; i >= 0; i--) {
    const char = clerkUserId.charCodeAt(i);
    hash2 = ((hash2 << 3) - hash2) + char;
    hash2 = hash2 & hash2;
  }
  const positiveHash2 = Math.abs(hash2).toString(16).padStart(8, '0');
  
  return [
    positiveHash.substring(0, 8),
    positiveHash.substring(8, 12) || '0000',
    '4' + positiveHash2.substring(1, 4),
    '8' + positiveHash2.substring(4, 7),
    positiveHash2.substring(0, 12).padEnd(12, '0')
  ].join('-');
}

// Test with some example user IDs
const testUsers = [
  'user_2example1',  // from sample data
  'user_2pOCpRZtlzJdBNm6Wqf3Km0KZBs', // example Clerk ID format
];

console.log('🔍 Testing UUID conversion:');
testUsers.forEach(userId => {
  const uuid = clerkUserIdToUuid(userId);
  console.log(`${userId} -> ${uuid}`);
});

// Show what company IDs exist in your database (from our previous test)
console.log('\n🏢 Company IDs found in jobs table:');
console.log('62c06e3f-0000-4340-86c3-23406c390000');

// Test a known company ID to see what Clerk ID would generate it
console.log('\n🔄 To match existing company ID, you would need to:');
console.log('1. Update your jobs to use the UUID from your current Clerk user ID');
console.log('2. OR create a company record with ID: 62c06e3f-0000-4340-86c3-23406c390000');