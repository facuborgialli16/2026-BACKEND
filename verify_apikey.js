
import ENVIRONMENT from './config/environment.config.js'

const check = async (desc, key, expectedStatus) => {
    const headers = key ? { 'x-api-key': key } : {}
    try {
        // Use a random path ensuring we hit the server but likely get 404 if auth passes
        const res = await fetch('http://localhost:8080/api/auth/ping-test-verify', {
            method: 'GET',
            headers: headers
        })

        // If we expect 404 (Success pass-through), we accept 200 as well just in case
        const passed = res.status === expectedStatus || (expectedStatus === 404 && res.status === 200);

        console.log(`${desc}: Status ${res.status} (Expected ${expectedStatus}) -> ${passed ? 'PASS' : 'FAIL'}`)
        if (!passed) {
            console.log('Response:', await res.text())
        }
    } catch (e) {
        console.error(`${desc}: Error`, e.message)
    }
}

(async () => {
    console.log("Verifying API Key Middleware...")
    await check('No Key', null, 401)
    await check('Invalid Key', 'wrong-key', 401)

    if (!ENVIRONMENT.API_KEY) {
        console.warn("WARNING: ENVIRONMENT.API_KEY is undefined. 'Valid Key' test might be misleading if it matches undefined.");
    }
    await check('Valid Key', ENVIRONMENT.API_KEY, 404)
})()
