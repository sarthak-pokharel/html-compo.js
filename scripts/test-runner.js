#!/usr/bin/env node

/**
 * Automated test runner for html-compo.js library
 * This script can be used in CI/CD environments to test the library
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function runTests() {
    let browser;
    let exitCode = 0;
    
    try {
        console.log('🚀 Starting HTML-Compo.js Test Suite...\n');
        
        // Check if test file exists
        const testFile = path.join(__dirname, '..', 'test', 'index.html');
        if (!fs.existsSync(testFile)) {
            throw new Error('Test file not found: test/index.html');
        }
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Enable console logs
        page.on('console', msg => {
            if (msg.type() === 'log') {
                console.log('📝', msg.text());
            } else if (msg.type() === 'error') {
                console.error('❌', msg.text());
            }
        });
        
        // Navigate to test page
        const fileUrl = `file://${path.resolve(testFile)}`;
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        
        console.log('📄 Test page loaded successfully');
        
        // Wait for tests to complete (they auto-run)
        await page.waitForTimeout(5000);
        
        // Extract test results
        const results = await page.evaluate(() => {
            const totalElement = document.getElementById('total-tests');
            const passedElement = document.getElementById('passed-tests');
            const failedElement = document.getElementById('failed-tests');
            
            if (!totalElement || !passedElement || !failedElement) {
                return null;
            }
            
            const total = parseInt(totalElement.textContent.match(/\d+/)[0]);
            const passed = parseInt(passedElement.textContent.match(/\d+/)[0]);
            const failed = parseInt(failedElement.textContent.match(/\d+/)[0]);
            
            return { total, passed, failed };
        });
        
        if (!results) {
            throw new Error('Could not extract test results from page');
        }
        
        // Display results
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        console.log(`Total Tests: ${results.total}`);
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
        
        // Set exit code based on results
        if (results.failed > 0) {
            exitCode = 1;
            console.log('\n❌ Some tests failed!');
        } else {
            console.log('\n🎉 All tests passed!');
        }
        
        // Extract individual test results for detailed reporting
        const testDetails = await page.evaluate(() => {
            const results = [];
            const testResults = document.querySelectorAll('.test-result');
            
            testResults.forEach((result, index) => {
                const testCase = result.closest('.test-case');
                const testName = testCase ? testCase.querySelector('h3').textContent : `Test ${index + 1}`;
                const status = result.classList.contains('test-pass') ? 'PASS' : 
                            result.classList.contains('test-fail') ? 'FAIL' : 'ERROR';
                const message = result.textContent.replace(/^[✅❌⚠️]\s*(PASS|FAIL|ERROR):\s*/, '');
                
                results.push({ testName, status, message });
            });
            
            return results;
        });
        
        // Display detailed results if there are failures
        if (results.failed > 0) {
            console.log('\n📋 Detailed Test Results:');
            console.log('==========================');
            testDetails.forEach(test => {
                const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
                console.log(`${icon} ${test.testName}: ${test.message}`);
            });
        }
        
    } catch (error) {
        console.error('💥 Test runner error:', error.message);
        exitCode = 1;
    } finally {
        if (browser) {
            await browser.close();
        }
        
        console.log('\n🏁 Test suite completed');
        process.exit(exitCode);
    }
}

// Check if puppeteer is available
try {
    require.resolve('puppeteer');
    runTests();
} catch (error) {
    console.error('❌ Puppeteer not found. Install it with: npm install --save-dev puppeteer');
    console.log('💡 Alternatively, run tests manually with: npm run test:manual');
    process.exit(1);
}
