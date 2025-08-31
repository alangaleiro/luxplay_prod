#!/usr/bin/env node

/**
 * Test script to validate claimable value retrieval from ActivePool contract
 * This script helps diagnose issues with pendingRewards function calls
 */

const { createPublicClient, http } = require('viem');
const { polygon } = require('viem/chains');
require('dotenv').config({ path: '.env.local' });

// Import ABI
const activePoolAbi = require('../abi/ActivePool.json');

async function testClaimableValues() {
  console.log('🔧 TESTING CLAIMABLE VALUES RETRIEVAL');
  console.log('=====================================');
  
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const activePoolAddress = process.env.NEXT_PUBLIC_ACTIVE_POOL_ADDRESS;
  const testAddress = process.env.NEXT_PUBLIC_DEFAULT_SPONSOR; // Use sponsor as test address
  
  if (!rpcUrl || !activePoolAddress) {
    console.error('❌ Missing required environment variables');
    return;
  }
  
  console.log('📍 Contract Address:', activePoolAddress);
  console.log('👤 Test Address:', testAddress);
  console.log('🌐 RPC URL:', rpcUrl.substring(0, 50) + '...');
  
  try {
    // Create public client
    const client = createPublicClient({
      chain: polygon,
      transport: http(rpcUrl)
    });
    
    console.log('\n🔍 Testing contract functions...');
    
    // Test userInfo function
    console.log('\n1️⃣ Testing userInfo function:');
    try {
      const userInfo = await client.readContract({
        address: activePoolAddress,
        abi: activePoolAbi,
        functionName: 'userInfo',
        args: [testAddress]
      });
      
      console.log('✅ userInfo result:', userInfo);
      console.log('📊 userInfo length:', Array.isArray(userInfo) ? userInfo.length : 'Not array');
      
      if (Array.isArray(userInfo)) {
        const labels = [
          'activeAmount', 'principal', 'voucherAmount', 'maxReferralCap',
          'plan', 'lastEpochId', 'pendingReward', 'logicAmount'
        ];
        userInfo.forEach((value, index) => {
          const label = labels[index] || `unknown_${index}`;
          console.log(`   [${index}] ${label}: ${value.toString()}`);
          if (index === 6) {
            console.log(`   🎯 CLAIMABLE (pendingReward): ${value.toString()} wei`);
            console.log(`   💰 CLAIMABLE (formatted): ${Number(value) / 1e18} PLAY`);
          }
        });
      }
    } catch (error) {
      console.error('❌ userInfo failed:', error.message);
    }
    
    // Test pendingRewards function (if exists)
    console.log('\n2️⃣ Testing viewPendingReward function:');
    try {
      const pendingReward = await client.readContract({
        address: activePoolAddress,
        abi: activePoolAbi,
        functionName: 'viewPendingReward',
        args: [testAddress]
      });
      
      console.log('✅ viewPendingReward result:', pendingReward.toString());
      console.log('💰 Formatted:', Number(pendingReward) / 1e18, 'PLAY');
    } catch (error) {
      console.error('❌ viewPendingReward failed:', error.message);
    }
    
    // Test viewUserTotals function
    console.log('\n3️⃣ Testing viewUserTotals function:');
    try {
      const userTotals = await client.readContract({
        address: activePoolAddress,
        abi: activePoolAbi,
        functionName: 'viewUserTotals',
        args: [testAddress]
      });
      
      console.log('✅ viewUserTotals result:', userTotals);
      if (Array.isArray(userTotals)) {
        const labels = ['deposited', 'active', 'warmUpDeposit', 'cap2xMax', 'apyReceived', 'referralReceived'];
        userTotals.forEach((value, index) => {
          const label = labels[index] || `unknown_${index}`;
          console.log(`   [${index}] ${label}: ${value?.toString()}`);
        });
      }
    } catch (error) {
      console.error('❌ viewUserTotals failed:', error.message);
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testClaimableValues().catch(console.error);